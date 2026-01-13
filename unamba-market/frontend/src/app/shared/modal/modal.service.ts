import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ModalConfig {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalSubject = new Subject<ModalConfig>();
  private responseSubject = new Subject<boolean>();

  public modal$ = this.modalSubject.asObservable();
  
  alert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string): void {
    const config: ModalConfig = {
      message,
      type,
      title: title || this.getDefaultTitle(type),
      confirmText: 'Aceptar',
      icon: this.getIcon(type)
    };
    this.modalSubject.next(config);
  }

  confirm(message: string, title: string = '¿Estás seguro?'): Observable<boolean> {
    const config: ModalConfig = {
      message,
      type: 'confirm',
      title,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      icon: 'bi-question-circle-fill'
    };
    this.modalSubject.next(config);
    return this.responseSubject.asObservable();
  }

  success(message: string, title: string = '¡Éxito!'): void {
    this.alert(message, 'success', title);
  }

  error(message: string, title: string = 'Error'): void {
    this.alert(message, 'error', title);
  }

  warning(message: string, title: string = 'Advertencia'): void {
    this.alert(message, 'warning', title);
  }

  info(message: string, title: string = 'Información'): void {
    this.alert(message, 'info', title);
  }

  respond(accepted: boolean): void {
    this.responseSubject.next(accepted);
  }

  private getDefaultTitle(type: string): string {
    const titles: { [key: string]: string } = {
      success: '¡Éxito!',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };
    return titles[type] || 'Notificación';
  }

  private getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
  }
}
