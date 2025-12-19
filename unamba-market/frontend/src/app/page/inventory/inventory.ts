import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { Navbar } from '../../component/navbar/navbar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {
  products: any[] = [];
  isLoading = true;
  apiUrl = environment.apiUrl;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory() {
    this.isLoading = true;
    this.productService.getMyInventory().subscribe({
      next: (resp: any) => {
        // Filtramos visualmente los eliminados para que no estorben, 
        // a menos que quieras una pestaña de "Papelera"
        this.products = resp.listProduct.filter((p: any) => p.status !== 'ELIMINADO');
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  changeStatus(id: string, newStatus: string) {
    this.productService.updateStatus(id, newStatus).subscribe({
      next: () => {
        // Actualizar localmente para evitar recargar toda la página
        const product = this.products.find(p => p.idProduct === id);
        if (product) {
            product.status = newStatus;
        }
        // Si eliminamos, lo quitamos de la lista
        if (newStatus === 'ELIMINADO') {
            this.products = this.products.filter(p => p.idProduct !== id);
        }
      },
      error: () => alert("Error al actualizar estado")
    });
  }

  editProduct(id: string) {
    this.router.navigate(['/product/edit', id]);
  }

  getImageUrl(filename: string): string {
    return filename ? `${this.apiUrl}/uploads/${filename}` : 'assets/no-image.png';
  }
}