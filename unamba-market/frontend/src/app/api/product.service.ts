import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.url}/getall`);
  }

  insert(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/insert`, formData);
  }
  getById(id: string): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }
}