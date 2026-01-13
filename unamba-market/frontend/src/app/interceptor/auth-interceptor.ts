import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../api/auth.service';
import { ModalService } from '../shared/modal/modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const modalService = inject(ModalService);
  
  // No agregar token a endpoints de autenticación
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/refresh-token')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  let clonedReq = req;
  if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 o 403, el token expiró
      if (error.status === 401 || error.status === 403) {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Intentar refrescar el token
        if (refreshToken && refreshToken !== 'null' && refreshToken !== 'undefined') {
          return authService.refreshToken().pipe(
            switchMap((response: any) => {
              // Guardar el nuevo token
              authService.saveSession(response);
              
              // Reintentar la petición original con el nuevo token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`
                }
              });
              return next(newReq);
            }),
            catchError((refreshError) => {
              // Si el refresh falla, cerrar sesión
              localStorage.clear();
              router.navigate(['/login']).then(() => {
                modalService.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'Sesión Expirada');
              });
              return throwError(() => refreshError);
            })
          );
        } else {
          // No hay refresh token, cerrar sesión directamente
          localStorage.clear();
          router.navigate(['/login']).then(() => {
            modalService.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'Sesión Expirada');
          });
        }
      }
      return throwError(() => error);
    })
  );
};