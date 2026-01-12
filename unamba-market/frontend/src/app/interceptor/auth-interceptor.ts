import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No agregar token a endpoints de autenticación
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/refresh-token')) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};