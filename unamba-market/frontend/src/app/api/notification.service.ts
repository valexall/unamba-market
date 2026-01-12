import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { environment } from '../../environments/environment';
import { switchMap, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${environment.apiUrl}/notification`;
  
  // Observable para el contador de notificaciones no leídas
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

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

  // Polling cada 30 segundos para actualizar el contador
  private startPolling() {
    interval(30000) // 30 segundos
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
          // Silenciar errores de polling (ej: usuario no logueado)
        }
      });
  }

  // Refrescar contador manualmente
  refreshUnreadCount() {
    this.getUnreadCount().subscribe({
      next: (response: any) => {
        if (response.count !== undefined) {
          this.updateUnreadCount(response.count);
        }
      }
    });
  }
}
