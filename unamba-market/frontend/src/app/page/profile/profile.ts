import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserProfile } from '../../api/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  isEditing = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Form data
  editForm = {
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bio: ''
  };

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.getProfile().subscribe({
      next: (response) => {
        console.log('Profile response:', response);
        if ((response.code === 'OK' || response.type === 'success') && response.profile) {
          this.profile = response.profile;
          this.editForm = {
            firstName: this.profile.firstName || '',
            lastName: this.profile.lastName || '',
            phone: this.profile.phone || '',
            address: this.profile.address || '',
            bio: this.profile.bio || ''
          };
          console.log('Profile loaded:', this.profile);
        } else {
          this.errorMessage = 'No se pudo cargar el perfil';
          console.error('Invalid response:', response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = error.error?.listMessage?.[0] || 'Error al cargar el perfil. Por favor, verifica que estés logueado.';
        this.isLoading = false;
      }
    });
  }

  toggleEdit() {
    if (this.isEditing) {
      // Cancel edit, restore original values
      if (this.profile) {
        this.editForm = {
          firstName: this.profile.firstName || '',
          lastName: this.profile.lastName || '',
          phone: this.profile.phone || '',
          address: this.profile.address || '',
          bio: this.profile.bio || ''
        };
      }
      this.selectedFile = null;
      this.previewUrl = null;
    }
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (!this.profile) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.updateProfile(this.editForm, this.selectedFile || undefined).subscribe({
      next: (response) => {
        if (response.code === 'OK' || response.type === 'success') {
          this.successMessage = 'Perfil actualizado correctamente';
          this.isEditing = false;
          this.selectedFile = null;
          this.previewUrl = null;
          this.loadProfile(); // Reload to get updated data
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.listMessage?.[0] || 'Error al actualizar el perfil';
        this.isLoading = false;
      }
    });
  }

  getAvatarUrl(): string {
    if (this.previewUrl) {
      return this.previewUrl;
    }
    if (this.profile?.profileImage) {
      return `${environment.apiUrl}/uploads/${this.profile.profileImage}`;
    }
    return 'https://via.placeholder.com/150?text=Usuario';
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
