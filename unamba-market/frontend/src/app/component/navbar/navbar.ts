import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../api/auth.service';
import { ChatService } from '../../api/chat.service';
import { NotificationService } from '../../api/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  userName: string | null = '';
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
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    if(this.isLoggedIn) {
        this.userName = localStorage.getItem('firstName') || 'Usuario';
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
      
      // Cargar contador inicial de notificaciones
      this.notificationService.refreshUnreadCount();
    }
  }

  ngOnDestroy(): void {
    if (this.notifSub) this.notifSub.unsubscribe();
    if (this.notificationSub) this.notificationSub.unsubscribe();
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }

  logout() {
    this.chatService.disconnect();
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']).then(() => window.location.reload());
  }
  
  loadNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (response: any) => {
        if (response.listNotification) {
          this.notifications = response.listNotification.map((n: any) => ({
            ...n,
            time: this.getRelativeTime(n.createdAt)
          }));
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
    alert('Funcionalidad de perfil en desarrollo');
    // TODO: Implementar página de perfil
    // this.router.navigate(['/profile']);
  }
}