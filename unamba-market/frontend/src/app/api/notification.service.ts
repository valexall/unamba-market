import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { switchMap, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${environment.apiUrl}/notification`;
  
  // Observable para el contador de notificaciones no leídas
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private pollingSub: Subscription | null = null;

  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<any> {
    return this.http.get(`${this.url}/my-notifications`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.url}/unread-count`);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.url}/${notificationId}/mark-read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.url}/mark-all-read`, {});
  }

  // Actualizar contador local
  updateUnreadCount(count: number) {
    this.unreadCountSubject.next(count);
  }

  // Iniciar polling cuando el usuario esté logueado
  startPolling() {
    if (this.pollingSub) {
      return; // Ya está haciendo polling
    }
    
    this.pollingSub = interval(30000) // 30 segundos
      .pipe(
        startWith(0),
        switchMap(() => this.getUnreadCount())
      )
      .subscribe({
        next: (response: any) => {
          if (response.count !== undefined) {
            this.updateUnreadCount(response.count);
          }
        },
        error: () => {
          // Silenciar errores de polling
        }
      });
  }
  
  // Detener polling cuando el usuario cierre sesión
  stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
    this.updateUnreadCount(0);
  }

  // Refrescar contador manualmente
  refreshUnreadCount() {
    this.getUnreadCount().subscribe({
      next: (response: any) => {
        if (response.count !== undefined) {
          this.updateUnreadCount(response.count);
        }
      },
      error: () => {
        // Silenciar error si no está logueado
      }
    });
  }
}
