import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client, StompSubscription } from '@stomp/stompjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private url = `${environment.apiUrl}/chat`;
  
  private stompClient: Client | null = null;
  private messageSubject = new Subject<any>();
  
  // Observable global para el número de notificaciones
  public unreadCount$ = new BehaviorSubject<number>(0);

  private currentSubscription: StompSubscription | null = null;

  constructor(private http: HttpClient, private ngZone: NgZone) { }

  // === HTTP METHODS ===
  sendMessage(productId: string, receiverId: string, content: string): Observable<any> {
    return this.http.post(`${this.url}/send`, { productId, receiverId, content });
  }

  getMyConversations(): Observable<any> {
    return this.http.get(`${this.url}/conversations`);
  }

  getMessages(conversationId: string): Observable<any> {
    return this.http.get(`${this.url}/messages/${conversationId}`);
  }

  // === CORRECCIÓN AQUÍ: Volvemos al nombre original ===
  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.url}/unread-count`);
  }

  // === WEBSOCKET REAL-TIME ===
  public initializeWebSocket() {
    if (this.stompClient && this.stompClient.active) return;

    const wsUrl = environment.apiUrl.replace('http', 'ws') + '/ws-market';
    const token = localStorage.getItem('token');
    
    // Limpieza de comillas si existen en el ID
    let myUserId = localStorage.getItem('userId');
    if (myUserId) myUserId = myUserId.replace(/['"]+/g, '');


    this.stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      
      onConnect: () => {
        if (myUserId) {
            const topic = `/topic/notifications/${myUserId}`;
            this.stompClient?.subscribe(topic, (msg) => {
                if (msg.body) {
                    const count = parseInt(msg.body);
                    // Actualizar UI inmediatamente
                    this.ngZone.run(() => {
                        this.unreadCount$.next(count);
                    });
                }
            });
        }
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame.headers['message']);
      }
    });

    this.stompClient.activate();
  }

  public subscribeToConversation(conversationId: string) {
    if (!this.stompClient) return;

    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }

    this.currentSubscription = this.stompClient.subscribe(`/topic/messages/${conversationId}`, (message) => {
        if (message.body) {
            this.ngZone.run(() => {
                this.messageSubject.next(JSON.parse(message.body));
            });
        }
    });
  }

  public getMessageUpdates(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  public disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}