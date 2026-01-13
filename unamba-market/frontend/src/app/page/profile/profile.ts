import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Navbar } from '../../component/navbar/navbar';
import { UserService, UserProfile } from '../../api/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Navbar, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  formProfile: FormGroup;
  isLoading = false;
  isSaving = false;
  apiUrl = environment.apiUrl;
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  activeTab: 'info' | 'edit' = 'info';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.formProfile = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      address: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.userService.getProfile().subscribe({
      next: (resp) => {
        if (resp.profile) {
          this.profile = resp.profile;
          this.updateForm(this.profile);
          if (this.profile.profileImage) {
            this.imagePreview = `${this.apiUrl}/uploads/${this.profile.profileImage}`;
          }
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  updateForm(profile: UserProfile) {
    this.formProfile.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      address: profile.address,
      bio: profile.bio
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.formProfile.invalid) return;
    this.isSaving = true;

    this.userService.updateProfile(this.formProfile.value, this.selectedFile || undefined)
      .subscribe({
        next: (response: any) => {
          this.isSaving = false;
          this.activeTab = 'info';
          // Actualizar nombre en localStorage si cambió
          const newName = this.formProfile.get('firstName')?.value;
          if (newName) localStorage.setItem('firstName', newName);
          // Actualizar foto de perfil en localStorage si cambió
          if (response.profile?.profileImage) {
            localStorage.setItem('profileImage', response.profile.profileImage);
          }
          this.loadProfile(); // Recargar datos frescos
          window.dispatchEvent(new Event('storage')); // Notificar a otros componentes
        },
        error: (err) => {
          this.isSaving = false;
        }
      });
  }

  getAvatarUrl(): string {
    return this.imagePreview || 
           (this.profile?.profileImage ? `${this.apiUrl}/uploads/${this.profile.profileImage}` : '/assets/no-image.png');
  }
}