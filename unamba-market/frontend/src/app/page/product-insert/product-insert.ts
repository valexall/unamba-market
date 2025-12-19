import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../api/product.service';
import { CategoryService } from '../../api/category.service';
import { Navbar } from '../../component/navbar/navbar';

@Component({
  selector: 'app-product-insert',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
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

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.formProduct = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      productCondition: ['USADO', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((resp: any) => {
      this.listCategory = resp.listCategory;
      if (this.listCategory.length > 0) {
        this.formProduct.patchValue({ 'categoryId': this.listCategory[0].idCategory });
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

  insert(): void {
    if (this.formProduct.invalid) return;

    let formData = new FormData();
    formData.append('dto.product.name', this.formProduct.get('name')?.value);
    formData.append('dto.product.description', this.formProduct.get('description')?.value);
    formData.append('dto.product.price', this.formProduct.get('price')?.value);
    formData.append('dto.product.productCondition', this.formProduct.get('productCondition')?.value);
    formData.append('dto.product.categoryId', this.formProduct.get('categoryId')?.value);

    for (let file of this.selectedFiles) {
      formData.append('images', file);
    }

    this.productService.insert(formData).subscribe({
      next: (resp) => {
        alert(resp.listMessage[0]);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert("Error: " + (err.error?.listMessage?.[0] || "Error al publicar"));
      }
    });
  }
}