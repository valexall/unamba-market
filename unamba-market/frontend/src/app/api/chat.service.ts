import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private url = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) { }

  sendMessage(productId: string, receiverId: string, content: string): Observable<any> {
    return this.http.post(`${this.url}/send`, { productId, receiverId, content });
  }

  getMyConversations(): Observable<any> {
    return this.http.get(`${this.url}/conversations`);
  }

  getMessages(conversationId: string): Observable<any> {
    return this.http.get(`${this.url}/messages/${conversationId}`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.url}/unread-count`);
  }
}