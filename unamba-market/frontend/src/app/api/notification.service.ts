import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { switchMap, startWith } from 'rxjs/operators';
import { Client } from '@stomp/stompjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${environment.apiUrl}/notification`;
  
  // Observable para el contador de notificaciones no leídas
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private pollingSub: Subscription | null = null;
  private stompClient: Client | null = null;

  constructor(private http: HttpClient, private ngZone: NgZone) {}

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
    
    // Inicializar WebSocket para notificaciones en tiempo real
    this.initializeWebSocket();
    
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
  
  // Inicializar WebSocket para notificaciones del sistema
  private initializeWebSocket() {
    if (this.stompClient && this.stompClient.active) return;

    const wsUrl = environment.apiUrl.replace('http', 'ws') + '/ws-market';
    const token = localStorage.getItem('token');
    let myUserId = localStorage.getItem('userId');
    if (myUserId) myUserId = myUserId.replace(/['"]+/g, '');

    this.stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      
      onConnect: () => {
        if (myUserId) {
            const topic = `/topic/system-notifications/${myUserId}`;
            this.stompClient?.subscribe(topic, (msg) => {
                if (msg.body) {
                    const count = parseInt(msg.body);
                    this.ngZone.run(() => {
                        this.unreadCountSubject.next(count);
                    });
                }
            });
        }
      },
      onStompError: (frame) => {
        // Error en conexión WebSocket de notificaciones
      }
    });

    this.stompClient.activate();
  }
  
  // Detener polling cuando el usuario cierre sesión
  stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
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
