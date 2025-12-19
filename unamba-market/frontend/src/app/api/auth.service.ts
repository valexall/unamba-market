import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.url}/login`, credentials);
  }

  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/register`, formData);
  }


  saveSession(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    // Guardamos nombre y foto si vienen
    if (response.firstName) localStorage.setItem('firstName', response.firstName);
    if (response.profileImage) localStorage.setItem('profileImage', response.profileImage);

    // 1. INTENTO: Si el backend envía el ID explícitamente, lo guardamos
    if (response.userId) {
      localStorage.setItem('userId', response.userId.toString());
    } else if (response.id) {
      localStorage.setItem('userId', response.id.toString());
    }
    // 2. INTENTO: Si no viene, lo sacamos del token AQUÍ (más limpio)
    else {
      const idFromToken = this.decodeToken(response.token);
      if (idFromToken) {
        localStorage.setItem('userId', idFromToken);
      }
    }
  }

  logout(): void {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  private decodeToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Busca el campo correcto (puede ser userId, id, sub, etc.)
      return payload.userId || payload.id || payload.sub || null;
    } catch (e) {
      console.error('Error decodificando token', e);
      return null;
    }
  }
}