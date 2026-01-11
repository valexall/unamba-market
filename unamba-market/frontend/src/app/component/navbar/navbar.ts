import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../api/auth.service';
import { ChatService } from '../../api/chat.service';
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

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
    if(this.isLoggedIn) {
        this.userName = localStorage.getItem('firstName') || 'Usuario';
    }
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      // Iniciar conexión global
      this.chatService.initializeWebSocket();

      // Carga inicial (HTTP) con el nombre corregido
      this.chatService.getUnreadCount().subscribe({
        next: (count: any) => this.chatService.unreadCount$.next(count)
      });

      // Suscripción reactiva (Socket)
      this.notifSub = this.chatService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notifSub) this.notifSub.unsubscribe();
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }

  logout() {
    this.chatService.disconnect();
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']).then(() => window.location.reload());
  }
}