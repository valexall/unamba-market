import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../api/auth.service';
import { ChatService } from '../../api/chat.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  isLoggedIn: boolean = false;
  userName: string | null = '';
  unreadCount: number = 0;

  isMenuOpen: boolean = false;

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
      this.loadNotifications();
      setInterval(() => this.loadNotifications(), 60000);
    }
  }

  loadNotifications() {
      this.chatService.getUnreadCount().subscribe({
          next: (count: any) => this.unreadCount = count,
          error: () => this.unreadCount = 0
      });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']).then(() => {
        window.location.reload(); 
    });
  }
}