import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from './modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  config: ModalConfig | null = null;
  private subscription?: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription = this.modalService.modal$.subscribe((config) => {
      this.config = config;
      this.isVisible = true;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(): void {
    if (this.config?.type === 'confirm') {
      this.modalService.respond(true);
    }
    this.close();
  }

  onCancel(): void {
    if (this.config?.type === 'confirm') {
      this.modalService.respond(false);
    }
    this.close();
  }

  close(): void {
    this.isVisible = false;
    setTimeout(() => {
      this.config = null;
    }, 300);
  }

  getTypeClass(): string {
    if (!this.config?.type) return 'modal-info';
    const classes: { [key: string]: string } = {
      success: 'modal-success',
      error: 'modal-error',
      warning: 'modal-warning',
      info: 'modal-info',
      confirm: 'modal-confirm'
    };
    return classes[this.config.type] || 'modal-info';
  }
}
