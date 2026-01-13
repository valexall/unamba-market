import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Navbar } from '../../component/navbar/navbar';
import { ProductService } from '../../api/product.service';
import { CategoryService } from '../../api/category.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-insert',
  standalone: true,
  imports: [CommonModule, Navbar, ReactiveFormsModule],
  templateUrl: './product-insert.html',
  styleUrl: './product-insert.css'
})
export class ProductInsert implements OnInit {
  formProduct: FormGroup;
  listCategory: any[] = [];
  selectedTags: string[] = [];
  tagControl = new FormControl('');
  

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  maxImages = 5;
  
  isEditMode = false;
  productId: string | null = null;
  isLoading = false;
  
  conditionOptions = [
    { value: 'NUEVO', label: 'Nuevo', icon: 'bi-stars', desc: 'Sin abrir, en su caja original.' },
    { value: 'COMO_NUEVO', label: 'Como Nuevo', icon: 'bi-check-circle', desc: 'Usado muy poco, sin detalles.' },
    { value: 'USADO', label: 'Usado', icon: 'bi-recycle', desc: 'Con señales de uso normal.' },
    { value: 'REPUESTO', label: 'Repuesto', icon: 'bi-tools', desc: 'Para piezas o reparación.' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location 
  ) {
    this.formProduct = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: [null, [Validators.required, Validators.min(1)]],
      productCondition: ['USADO', Validators.required],
      categoryNames: [[]]
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((resp: any) => {
      this.listCategory = resp.listCategory || [];
    });

    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string) {
    this.productService.getById(id).subscribe((resp: any) => {
      const p = resp.listProduct[0];
      this.formProduct.patchValue({
        name: p.name,
        description: p.description,
        price: p.price,
        productCondition: p.productCondition
      });
      
      if (p.categoryNames) this.selectedTags = p.categoryNames;

      if (p.images && p.images.length > 0) {
         p.images.forEach((img: string) => {
             this.imagePreviews.push(`${environment.apiUrl}/uploads/${img}`);

         });
      } else if (p.imageUrl) {
         this.imagePreviews.push(`${environment.apiUrl}/uploads/${p.imageUrl}`);
      }
    });
  }

  // === MULTI-IMAGEN LOGIC ===
  
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      const files = event.target.files;
      
      if (this.selectedFiles.length + files.length > this.maxImages) {
        alert(`Solo puedes subir un máximo de ${this.maxImages} fotos.`);
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) continue;

        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
    event.target.value = ''; 
  }

  removeImage(index: number) {
    if (index < this.selectedFiles.length) {
    }
    if (this.selectedFiles[index]) {
        this.selectedFiles.splice(index, 1);
    }
    this.imagePreviews.splice(index, 1);
  }

  // === UI Helpers ===
  setCondition(value: string) {
    this.formProduct.patchValue({ productCondition: value });
  }

  addTag(event: any) {
    const value = (event.target.value || '').trim();
    if (value) {
      if (this.selectedTags.length >= 5) {
        alert("Máximo 5 etiquetas"); return;
      }
      if (!this.selectedTags.includes(value)) {
        this.selectedTags.push(value);
      }
    }
    this.tagControl.setValue('');
    event.preventDefault();
  }

  removeTag(index: number) {
    this.selectedTags.splice(index, 1);
  }

  removeLastTag(event: any) {
    if (!this.tagControl.value && this.selectedTags.length > 0) {
      this.selectedTags.pop();
    }
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    // Marcar todos los campos como tocados para mostrar errores
    this.formProduct.markAllAsTouched();
    
    if (this.formProduct.invalid) {
      // Identificar qué campos están inválidos
      const invalidFields = [];
      if (this.formProduct.get('name')?.invalid) invalidFields.push('Título');
      if (this.formProduct.get('description')?.invalid) invalidFields.push('Descripción');
      if (this.formProduct.get('price')?.invalid) invalidFields.push('Precio');
      if (this.formProduct.get('productCondition')?.invalid) invalidFields.push('Estado del producto');
      
      alert(`Por favor completa los siguientes campos:\n• ${invalidFields.join('\n• ')}`);
      
      // Scroll al primer campo inválido
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isLoading = true;
    const formData = new FormData();
    
    this.formProduct.patchValue({ categoryNames: this.selectedTags });
    
    // Construir el objeto que espera el backend
    const productData = this.formProduct.value;
    
    // Agregar cada campo del producto directamente al FormData
    formData.append('dto.product.name', productData.name);
    formData.append('dto.product.description', productData.description);
    formData.append('dto.product.price', productData.price.toString());
    formData.append('dto.product.productCondition', productData.productCondition);
    
    // Agregar categorías
    if (this.selectedTags && this.selectedTags.length > 0) {
      this.selectedTags.forEach((tag, index) => {
        formData.append(`dto.product.categoryNames[${index}]`, tag);
      });
    }
    
    // Agregar imágenes
    if (this.selectedFiles.length > 0) {
        this.selectedFiles.forEach(file => {
            formData.append('images', file);
        });
    }

    const request$ = (this.isEditMode && this.productId) 
        ? this.productService.update(this.productId, formData)
        : this.productService.insert(formData);

    request$.subscribe({
        next: () => {
            this.isLoading = false;
            alert(this.isEditMode ? 'Producto actualizado' : 'Producto publicado con éxito');
            this.router.navigate(['/inventory']);
        },
        error: (e) => {
            this.isLoading = false;
            console.error('Error al publicar producto:', e);
            
            // Si es error 403, el token expiró o no está autenticado
            if (e.status === 403) {
                alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                localStorage.removeItem('token');
                this.router.navigate(['/login'], { 
                    queryParams: { returnUrl: '/product/create' }
                });
                return;
            }
            
            const errorMsg = e.error?.listMessage?.[0] || 'Ocurrió un error al guardar el producto.';
            alert(errorMsg);
        }
    });
  }
}