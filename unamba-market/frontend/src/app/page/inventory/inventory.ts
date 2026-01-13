import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { Navbar } from '../../component/navbar/navbar';
import { environment } from '../../../environments/environment';
import { ModalService } from '../../shared/modal/modal.service';

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

  constructor(
    private productService: ProductService, 
    private router: Router,
    private modalService: ModalService
  ) {}

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
      error: () => this.modalService.error('No se pudo actualizar el estado del producto.')
    });
  }

  editProduct(id: string) {
    this.router.navigate(['/product/edit', id]);
  }

  getImageUrl(filename: string): string {
    return filename ? `${this.apiUrl}/uploads/${filename}` : 'assets/no-image.png';
  }
}