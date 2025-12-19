import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../api/product.service';
import { CategoryService } from '../../api/category.service';
import { Navbar } from '../../component/navbar/navbar';

@Component({
  selector: 'app-product-insert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, RouterLink],
  templateUrl: './product-insert.html',
  styleUrl: './product-insert.css'
})
export class ProductInsert implements OnInit {
  formProduct: FormGroup;
  tagControl = new FormControl();
  listCategory: any[] = [];
  selectedFiles: File[] = [];
  previews: string[] = [];
  selectedTags: string[] = [];
  isEditMode = false;
  productId: string | null = null;
  currentProduct: any = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formProduct = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      productCondition: ['USADO', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Detectar si estamos en modo edición
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    this.categoryService.getAll().subscribe((resp: any) => {
      this.listCategory = resp.listCategory;
      if (this.listCategory.length > 0) {
        this.formProduct.patchValue({ 'categoryId': this.listCategory[0].idCategory });
      }
      
      // Si estamos en modo edición, cargar los datos del producto
      if (this.isEditMode && this.productId) {
        this.loadProductData(this.productId);
      }
    });
  }

  addTag(event: any) {
    event.preventDefault();
    const value = this.tagControl.value?.trim();

    if (value && !this.selectedTags.includes(value)) {
      if (this.selectedTags.length >= 5) {
        alert("Máximo 5 etiquetas");
        return;
      }
      this.selectedTags.push(value);
      this.tagControl.setValue(''); 
    }
  }

  removeTag(index: number) {
    this.selectedTags.splice(index, 1);
  }

  loadProductData(productId: string) {
    this.productService.getById(productId).subscribe({
      next: (resp: any) => {
        this.currentProduct = resp.listProduct[0]; // El backend retorna un array con un elemento
        
        // Llenar el formulario con los datos del producto
        this.formProduct.patchValue({
          name: this.currentProduct.name,
          price: this.currentProduct.price,
          productCondition: this.currentProduct.productCondition,
          description: this.currentProduct.description
        });
        
        // Cargar las categorías/etiquetas
        if (this.currentProduct.categoryNames && this.currentProduct.categoryNames.length > 0) {
          this.selectedTags = [...this.currentProduct.categoryNames];
        }
        
        // Cargar imágenes existentes como previews (sin archivos reales)
        if (this.currentProduct.images && this.currentProduct.images.length > 0) {
          this.previews = this.currentProduct.images.map((img: string) => 
            this.productService.getImageUrl(img));
        }
      },
      error: (err) => {
        console.error('Error cargando producto:', err);
        alert('No se pudo cargar el producto');
        this.router.navigate(['/inventory']);
      }
    });
  }

  removeLastTag(event: any) {
    if (!this.tagControl.value && this.selectedTags.length > 0) {
      this.selectedTags.pop();
    }
  }

  onFileSelect(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = event.target.files;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1);
  }

  onSubmit() {
    if (this.selectedTags.length === 0) {
      alert("Agrega al menos una categoría/etiqueta.");
      return;
    }
    if (this.formProduct.invalid) return;

    if (this.isEditMode && this.productId) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct() {
    const formData = new FormData();
    formData.append('dto.product.name', this.formProduct.get('name')?.value);
    formData.append('dto.product.description', this.formProduct.get('description')?.value);
    formData.append('dto.product.price', this.formProduct.get('price')?.value);
    formData.append('dto.product.productCondition', this.formProduct.get('productCondition')?.value);
    
    for (let tag of this.selectedTags) {
      formData.append('dto.product.categoryNames', tag);
    }

    for (let file of this.selectedFiles) {
      formData.append('images', file);
    }

    this.productService.insert(formData).subscribe({
      next: (resp) => {
        alert('¡Producto publicado con éxito!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al publicar: ' + (err.error?.listMessage?.[0] || "Error desconocido"));
      }
    });
  }

  updateProduct() {
    const formData = new FormData();
    formData.append('dto.product.name', this.formProduct.get('name')?.value);
    formData.append('dto.product.description', this.formProduct.get('description')?.value);
    formData.append('dto.product.price', this.formProduct.get('price')?.value);
    formData.append('dto.product.productCondition', this.formProduct.get('productCondition')?.value);
    
    for (let tag of this.selectedTags) {
      formData.append('dto.product.categoryNames', tag);
    }

    // Solo agregar nuevas imágenes si hay archivos seleccionados
    for (let file of this.selectedFiles) {
      formData.append('images', file);
    }

    this.productService.update(this.productId!, formData).subscribe({
      next: (resp) => {
        alert('¡Producto actualizado con éxito!');
        this.router.navigate(['/inventory']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar: ' + (err.error?.listMessage?.[0] || "Error desconocido"));
      }
    });
  }
}