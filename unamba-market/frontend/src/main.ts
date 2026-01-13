import { bootstrapApplication } from '@angular/platform-browser';
import { IMAGE_CONFIG } from '@angular/common';
import { appConfig } from './app/app.config';
import { App } from './app/app';

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
  .catch((err) => console.error(err));
