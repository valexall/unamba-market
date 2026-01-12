import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../api/product.service';
import { CategoryService } from '../../api/category.service';
import { FavoriteService } from '../../api/favorite.service';
import { AuthService } from '../../api/auth.service';
import { ChatService } from '../../api/chat.service';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  listProduct: any[] = [];
  allProducts: any[] = [];
  listCategory: any[] = [];
  
  // Paginación
  currentPage: number = 0;
  pageSize: number = 12;
  totalPages: number = 0;
  totalElements: number = 0;
  isLastPage: boolean = false;
  isFirstPage: boolean = true;
  
  apiUrl = environment.apiUrl;
  isLoggedIn: boolean = false;
  userName: string | null = '';
  selectedCategory: string | null = null;
  sidebarOpen: boolean = false;
  
  // Variables para notificaciones
  unreadCount: number = 0;
  private notifSub: Subscription | null = null;
  
  showMyProducts: boolean = false;
  myUserId: string | null = '';
  
  // Variables de búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;

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
        // Nos suscribimos al observable global del servicio
        // Así el contador de la barra lateral se actualiza igual que el Navbar
        this.notifSub = this.chatService.unreadCount$.subscribe(count => {
            this.unreadCount = count;
        });
    }
  }

  ngOnDestroy(): void {
      if (this.notifSub) this.notifSub.unsubscribe();
  }

  loadData() {
    this.categoryService.getAll().subscribe((resp: any) => {
        this.listCategory = resp.listCategory || [];
    });

    this.loadProducts();
  }

  loadProducts(page: number = 0) {
    if (this.isSearching && this.searchTerm.trim()) {
      this.performSearch(page);
    } else {
      this.productService.getAllPaginated(page, this.pageSize).subscribe((resp: any) => {
          if (resp.data) {
              this.listProduct = resp.data.content || [];
              this.allProducts = resp.data.content || [];
              this.currentPage = resp.data.pageNumber;
              this.totalPages = resp.data.totalPages;
              this.totalElements = resp.data.totalElements;
              this.isLastPage = resp.data.last;
              this.isFirstPage = resp.data.first;
          }
      });
    }
  }

  performSearch(page: number = 0) {
    if (!this.searchTerm.trim()) {
      this.clearSearch();
      return;
    }
    
    this.isSearching = true;
    this.productService.searchProducts(this.searchTerm, page, this.pageSize).subscribe((resp: any) => {
        if (resp.data) {
            this.listProduct = resp.data.content || [];
            this.allProducts = resp.data.content || [];
            this.currentPage = resp.data.pageNumber;
            this.totalPages = resp.data.totalPages;
            this.totalElements = resp.data.totalElements;
            this.isLastPage = resp.data.last;
            this.isFirstPage = resp.data.first;
            this.selectedCategory = null;
        }
    });
  }

  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    if (!this.searchTerm.trim()) {
      this.clearSearch();
    }
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.isSearching = false;
    this.selectedCategory = null;
    this.loadProducts();
  }

  nextPage() {
    if (!this.isLastPage) {
        this.loadProducts(this.currentPage + 1);
    }
  }

  previousPage() {
    if (!this.isFirstPage) {
        this.loadProducts(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    this.loadProducts(page);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
        start = Math.max(0, end - maxVisible);
    }
    
    for (let i = start; i < end; i++) {
        pages.push(i);
    }
    return pages;
  }
  
  filterCategory(categoryName: string | null) {
      this.selectedCategory = categoryName;
      this.showMyProducts = false;
      this.isSearching = false;
      this.searchTerm = '';
      
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
      }
      if (window.innerWidth < 992) this.sidebarOpen = false;
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }

  getImageUrl(filename: string): string {
      return filename ? `${this.apiUrl}/uploads/${filename}` : 'assets/no-image.png'; 
  }

  // Exponer Math para usar en template
  Math = Math;

  handleSellAction() {
      if (this.isLoggedIn) {
          this.router.navigate(['/product/create']);
      } else {
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