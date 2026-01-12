import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private url = `${environment.apiUrl}/product`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${this.url}/getall`);
  }

  getAllPaginated(page: number = 0, size: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.url}/paginated`, { params });
  }

  insert(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/insert`, formData);
  }
  getById(id: string): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  getMyInventory(): Observable<any> {
    return this.http.get(`${this.url}/my-inventory`);
  }

  updateStatus(id: string, status: string): Observable<any> {
    // Usamos PATCH con query param para simplificar
    return this.http.patch(`${this.url}/${id}/status?status=${status}`, {});
  }

  update(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.url}/${id}`, formData);
  }

  getImageUrl(filename: string): string {
    return filename ? `${environment.apiUrl}/uploads/${filename}` : 'assets/no-image.png';
  }
}