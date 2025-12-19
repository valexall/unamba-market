import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { CategoryService } from '../../api/category.service';
import { FavoriteService } from '../../api/favorite.service';
import { AuthService } from '../../api/auth.service';
import { ChatService } from '../../api/chat.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  listProduct: any[] = [];
  allProducts: any[] = [];
  listCategory: any[] = [];
  
  apiUrl = environment.apiUrl;
  isLoggedIn: boolean = false;
  userName: string | null = '';
  selectedCategory: string | null = null;
  sidebarOpen: boolean = false;
  unreadCount: number = 0;
  
  showMyProducts: boolean = false;
  myUserId: string | null = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private favService: FavoriteService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    if(this.isLoggedIn) {
        this.userName = localStorage.getItem('firstName');
        this.myUserId = localStorage.getItem('userId');
    }
  }

  ngOnInit(): void {
    this.loadData();
    if (this.isLoggedIn) {
        this.chatService.getUnreadCount().subscribe({
            next: (count: any) => this.unreadCount = count,
            error: () => this.unreadCount = 0
        });
    }
  }

  loadData() {
    this.categoryService.getAll().subscribe((resp: any) => {
        this.listCategory = resp.listCategory || [];
    });

    this.productService.getAll().subscribe((resp: any) => {
        this.listProduct = resp.listProduct || [];
        this.allProducts = resp.listProduct || [];
    });
  }

  filterCategory(categoryName: string | null) {
      this.selectedCategory = categoryName;
      this.showMyProducts = false;
      
      if (categoryName) {
          this.listProduct = this.allProducts.filter(p => 
              p.categoryNames && p.categoryNames.includes(categoryName)
          );
      } else {
          this.listProduct = this.allProducts;
      }
      
      if (window.innerWidth < 992) this.sidebarOpen = false;
  }

  filterMyProducts() {
      if (!this.isLoggedIn) {
          alert("Inicia sesión para ver tus publicaciones");
          return;
      }
      this.showMyProducts = true;
      this.selectedCategory = null;

      if (this.myUserId) {
          this.listProduct = this.allProducts.filter(p => p.userId === this.myUserId || p.sellerId === this.myUserId);
      } else {
          alert("No se pudo identificar tu usuario.");
      }
      if (window.innerWidth < 992) this.sidebarOpen = false;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  getImageUrl(filename: string): string {
      return filename ? `${this.apiUrl}/uploads/${filename}` : 'assets/no-image.png'; 
  }

  handleSellAction() {
      if (this.isLoggedIn) {
          this.router.navigate(['/product/create']);
      } else {
          alert("Debes iniciar sesión para publicar.");
          this.router.navigate(['/login']);
      }
  }

  toggleFavorite(id: string) {
      if (!this.isLoggedIn) {
          alert("Inicia sesión para guardar favoritos.");
          return;
      }
      this.favService.toggle(id).subscribe({
          next: (resp: any) => alert(resp.listMessage?.[0] || "Favorito actualizado"),
          error: () => alert("Error al agregar favorito")
      });
  }

  logout() {
      this.authService.logout();
      window.location.reload(); 
  }
}