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

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.url}/refresh-token`, { refreshToken });
  }

  saveSession(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    
    // Guardar refresh token
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
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
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Limpiar localStorage inmediatamente
    localStorage.clear();
    
    // Intentar revocar el token en el servidor (no bloqueante)
    if (refreshToken) {
      this.http.post(`${this.url}/logout`, { refreshToken }).subscribe({
        error: () => {
          // Ignorar errores, el localStorage ya está limpio
        }
      });
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Verificar si el token está expirado
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    
    return true;
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return true;
    
    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;
      
      // exp está en segundos, Date.now() en milisegundos
      const isExpired = Date.now() >= exp * 1000;
      return isExpired;
    } catch (e) {
      return true;
    }
  }

  private decodeToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Busca el campo correcto (puede ser userId, id, sub, etc.)
      return payload.userId || payload.id || payload.sub || null;
    } catch (e) {
      return null;
    }
  }
}