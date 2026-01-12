import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../api/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  formLogin: FormGroup;
  isLoading: boolean = false;
  returnUrl: string = '/home';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formLogin = this.formBuilder.group({
      'email': ['', [Validators.required, Validators.email]],
      'password': ['', Validators.required]
    });

    // Obtener la URL a la que intentaba acceder
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  login(): void {
    if (this.formLogin.valid) {
      this.isLoading = true; 
      
      this.authService.login(this.formLogin.value).subscribe({
        next: (resp) => {
          this.authService.saveSession(resp);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || "Credenciales incorrectas o error de conexión.";
          alert("Error: " + msg);
        }
      });
    } else {
      this.formLogin.markAllAsTouched();
    }
  }
}