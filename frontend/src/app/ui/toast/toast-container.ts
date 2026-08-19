import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconButton } from '../icon-button/icon-button';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconButton],
  template: `
    <div class="stack" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" role="status" [attr.data-variant]="toast.variant">
          <span class="message">{{ toast.message }}</span>
          <button
            app-icon-button
            icon="x"
            aria-label="Dismiss notification"
            (click)="dismiss(toast.id)"
          ></button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  private readonly service = inject(ToastService);
  protected readonly toasts = this.service.toasts;

  protected dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
