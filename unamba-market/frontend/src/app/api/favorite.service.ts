import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private url = `${environment.apiUrl}/favorite`;

  constructor(private http: HttpClient) {}

  toggle(productId: string): Observable<any> {
    return this.http.post(`${this.url}/toggle/${productId}`, {});
  }
}