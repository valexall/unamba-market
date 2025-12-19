import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../api/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  formRegister: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null; 
  isLoading: boolean = false; 

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formRegister = this.formBuilder.group({
      'firstName': ['', [Validators.required, Validators.minLength(2)]],
      'lastName': ['', [Validators.required, Validators.minLength(2)]],
      'email': ['', [Validators.required, Validators.email]],
      'password': ['', [Validators.required, Validators.minLength(6)]],
      'cellphone': ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile as Blob);
    }
  }

  register(): void {
    if (this.formRegister.invalid) {
        this.formRegister.markAllAsTouched();
        return;
    }

    this.isLoading = true;

    let formData = new FormData();
    formData.append('dto.user.firstName', this.formRegister.get('firstName')?.value);
    formData.append('dto.user.lastName', this.formRegister.get('lastName')?.value);
    formData.append('dto.user.email', this.formRegister.get('email')?.value);
    formData.append('dto.user.password', this.formRegister.get('password')?.value);
    formData.append('dto.user.cellphone', this.formRegister.get('cellphone')?.value);

    if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: (resp) => {
        this.authService.saveSession(resp);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.listMessage?.[0] || "No se pudo registrar el usuario.";
        alert("Error: " + msg);
      }
    });
  }
}