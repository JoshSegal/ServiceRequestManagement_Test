import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error';

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<Toast[]>([]);
  private counter = 0;

  readonly toasts = this.items.asReadonly();

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  dismiss(id: number): void {
    this.items.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private show(message: string, variant: ToastVariant): void {
    this.counter += 1;
    const id = this.counter;
    this.items.update((toasts) => [...toasts, { id, message, variant }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
