import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  idUser: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dni: string;
  profileImage: string;
  bio: string;
  totalProducts: number;
  totalSales: number;
}

interface ProfileResponse {
  code?: string;
  type?: string;
  listMessage: string[];
  profile: UserProfile;
}

interface UpdateResponse {
  code?: string;
  type?: string;
  listMessage: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/user';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: Partial<UserProfile>, avatar?: File): Observable<UpdateResponse> {
    const formData = new FormData();
    
    if (profileData.firstName) formData.append('firstName', profileData.firstName);
    if (profileData.lastName) formData.append('lastName', profileData.lastName);
    if (profileData.phone) formData.append('phone', profileData.phone);
    if (profileData.address) formData.append('address', profileData.address);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (avatar) formData.append('avatar', avatar);

    return this.http.put<UpdateResponse>(`${this.apiUrl}/profile`, formData);
  }
}
