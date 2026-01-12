import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../api/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 y no es endpoint de autenticación
      if (error.status === 401 && 
          !req.url.includes('/auth/refresh-token') && 
          !req.url.includes('/auth/login') &&
          !req.url.includes('/auth/register')) {
        const refreshToken = authService.getRefreshToken();
        
        if (refreshToken) {
          // Intentar renovar el token
          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              // Guardar el nuevo token
              localStorage.setItem('token', response.accessToken);
              
              // Reintentar la petición original con el nuevo token
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`
                }
              });
              
              return next(clonedReq);
            }),
            catchError((refreshError) => {
              // Si falla el refresh, cerrar sesión
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // No hay refresh token, redirigir a login
          authService.logout();
          router.navigate(['/login']);
        }
      }
      
      return throwError(() => error);
    })
  );
};
