import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../api/product.service';
import { AuthService } from '../../../api/auth.service';
import { Navbar } from '../../../component//navbar/navbar';
import { environment } from '../../../../environments/environment';
import { ChatService } from '../../../api/chat.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: any = null;
  apiUrl = environment.apiUrl;
  selectedImage: string = '';
  galleryImages: string[] = [];
  
  isOwner: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private chatService: ChatService,
    private modalService: ModalService
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.productService.getById(id).subscribe({
      next: (resp: any) => {
        if (resp.listProduct && resp.listProduct.length > 0) {
          this.product = resp.listProduct[0];

          this.selectedImage = this.product.imageUrl 
              ? `${this.apiUrl}/uploads/${this.product.imageUrl}` 
              : 'assets/no-image.png';


          if (this.product.images && this.product.images.length > 0) {
            this.galleryImages = this.product.images.map((img: string) => `${this.apiUrl}/uploads/${img}`);
          } else {
            this.galleryImages = [this.selectedImage];
          }

          const myId = localStorage.getItem('userId');
          if (myId && this.product.sellerId === myId) {
             this.isOwner = true;
          }
        }
      },
      error: (err) => {
        this.router.navigate(['/home']);
      }
    });
  }

  changeImage(url: string) {
      this.selectedImage = url;
  }

  contactSeller() {
      if (!this.isLoggedIn) {
          this.modalService.warning('Debes iniciar sesión para contactar al vendedor.', 'Sesión Requerida');
          this.router.navigate(['/login']);
          return;
      }

      if (this.isOwner) {
          this.modalService.info('No puedes contactarte a ti mismo.');
          return;
      }

      if (!this.product.sellerId) {
          this.modalService.error('No se pudo identificar al vendedor.');
          return;
      }

      const msg = `Hola, estoy interesado en tu producto "${this.product.name}".`;
      
      this.chatService.sendMessage(this.product.idProduct, this.product.sellerId, msg).subscribe({
          next: () => {
              this.router.navigate(['/chat']);
          },
          error: (err) => {
              const errorMsg = err.error?.listMessage?.[0] || err.error?.message || "Error al iniciar el chat.";
              this.modalService.error(errorMsg, 'Error de Comunicación');
          }
      });
  }

  buyProduct() {
      if (!this.isLoggedIn) {
          this.modalService.warning('Debes iniciar sesión para comprar.', 'Sesión Requerida');
          this.router.navigate(['/login']);
          return;
      }
      
      this.modalService.confirm(
          `¿Estás seguro de comprar "${this.product.name}" por S/ ${this.product.price}?`,
          'Confirmar Compra'
      ).subscribe(confirmed => {
          if (confirmed) {
              this.modalService.info("¡Solicitud de compra enviada! (Funcionalidad de Transacción en proceso)");
          }
      });
  }
}