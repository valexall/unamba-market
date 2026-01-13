import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../api/auth.service';
import { ChatService } from '../../api/chat.service';
import { NotificationService } from '../../api/notification.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy, AfterViewInit {
  isLoggedIn: boolean = false;
  userName: string | null = '';
  profileImage: string | null = null;
  apiUrl = environment.apiUrl;
  unreadCount: number = 0;
  isMenuOpen: boolean = false;
  private notifSub: Subscription | null = null;
  
  // Notificaciones
  notifications: any[] = [];
  notificationUnreadCount: number = 0;
  private notificationSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    if(this.isLoggedIn) {
        this.userName = localStorage.getItem('firstName') || 'Usuario';
        this.profileImage = localStorage.getItem('profileImage');
    }
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      // Iniciar conexión WebSocket para chat
      this.chatService.initializeWebSocket();

      // Cargar contador de mensajes no leídos
      this.chatService.getUnreadCount().subscribe({
        next: (count: any) => this.chatService.unreadCount$.next(count)
      });

      // Suscribirse a mensajes no leídos
      this.notifSub = this.chatService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });
      
      // Suscribirse al contador de notificaciones
      this.notificationSub = this.notificationService.unreadCount$.subscribe(count => {
        this.notificationUnreadCount = count;
      });
      
      // Iniciar polling de notificaciones
      this.notificationService.startPolling();

      // Escuchar cambios en localStorage para actualizar foto de perfil
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  ngAfterViewInit(): void {
    if (this.isLoggedIn) {
      // Capturar evento de Bootstrap cuando se abre el dropdown de notificaciones
      const notificationDropdown = this.elementRef.nativeElement.querySelector('#notificationsDropdown');
      if (notificationDropdown) {
        notificationDropdown.addEventListener('shown.bs.dropdown', () => {
          this.loadNotifications();
        });
      }
    }
  }

  handleStorageChange(event: StorageEvent) {
    if (event.key === 'profileImage') {
      this.profileImage = localStorage.getItem('profileImage');
    } else if (event.key === 'firstName') {
      this.userName = localStorage.getItem('firstName');
    }
  }

  ngOnDestroy(): void {
    if (this.notifSub) this.notifSub.unsubscribe();
    if (this.notificationSub) this.notificationSub.unsubscribe();
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }

  logout() {
    // Detener servicios
    this.chatService.disconnect();
    this.notificationService.stopPolling();
    
    // Limpiar listeners
    if (this.notifSub) this.notifSub.unsubscribe();
    if (this.notificationSub) this.notificationSub.unsubscribe();
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    
    // Cerrar sesión y limpiar localStorage
    this.authService.logout();
    this.closeMenu();
    
    // Redirigir y recargar
    this.router.navigate(['/landing']).then(() => {
      window.location.reload();
    });
  }
  
  loadNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (response: any) => {
        if (response.listNotification) {
          this.notifications = response.listNotification.map((n: any) => ({
            ...n,
            time: this.getRelativeTime(n.createdAt)
          }));
        } else {
          this.notifications = [];
        }
      },
      error: () => {
        this.notifications = [];
      }
    });
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getNotificationIcon(type: string): string {
    switch(type) {
      case 'MESSAGE': return 'bi-chat-dots-fill text-primary';
      case 'PRODUCT_SOLD': return 'bi-bag-check-fill text-success';
      case 'PRODUCT_INTEREST': return 'bi-heart-fill text-danger';
      case 'SYSTEM': return 'bi-info-circle-fill text-info';
      default: return 'bi-bell-fill';
    }
  }

  handleNotificationClick(notification: any) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.idNotification).subscribe({
        next: () => {
          notification.isRead = true;
          this.notificationService.refreshUnreadCount();
        }
      });
    }

    this.closeMenu();
    
    switch(notification.type) {
      case 'MESSAGE':
        this.router.navigate(['/chat']);
        break;
      case 'PRODUCT_SOLD':
      case 'PRODUCT_INTEREST':
        if (notification.relatedId) {
          this.router.navigate(['/product', notification.relatedId]);
        } else {
          this.router.navigate(['/inventory']);
        }
        break;
      default:
        break;
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.notificationService.refreshUnreadCount();
      }
    });
  }

  goToProfile() {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  getProfileImageUrl(): string {
    if (this.profileImage) {
      return `${this.apiUrl}/uploads/${this.profileImage}`;
    }
    return `https://ui-avatars.com/api/?name=${this.userName}&background=0D47A1&color=fff`;
  }
}