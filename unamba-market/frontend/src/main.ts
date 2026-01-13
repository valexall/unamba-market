import { bootstrapApplication } from '@angular/platform-browser';
import { IMAGE_CONFIG } from '@angular/common';
import { isDevMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Desactivar logs en consola para producción limpia
if (!isDevMode()) {
  console.log = () => {};
  console.debug = () => {};
}

// Configuración para suprimir warnings de imágenes en desarrollo
const imageConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true
      }
    }
  ]
};

bootstrapApplication(App, imageConfig)
  .catch((err) => {
    // Solo mostrar errores críticos de arranque
    if (isDevMode()) {
      console.error('Error al iniciar la aplicación:', err);
    }
  });
