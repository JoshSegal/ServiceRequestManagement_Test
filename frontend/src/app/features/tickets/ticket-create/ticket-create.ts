import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TicketApiService } from '../../../core/services/ticket-api.service';
import { ToastService } from '../../../ui/toast/toast.service';
import { Button } from '../../../ui/button/button';
import { TicketForm, buildTicketForm } from '../ticket-form/ticket-form';

@Component({
  selector: 'app-ticket-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, TicketForm],
  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.scss',
})
export class TicketCreate {
  private readonly api = inject(TicketApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly form = buildTicketForm();
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    this.api
      .create({
        title: value.title,
        description: value.description,
        status: value.status,
        priority: value.priority!,
        labels: value.labels,
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.toast.success('Ticket created.');
          void this.router.navigate(['/tickets', created.id]);
        },
        error: () => this.saving.set(false),
      });
  }

  protected cancel(): void {
    void this.router.navigate(['/tickets']);
  }
}
