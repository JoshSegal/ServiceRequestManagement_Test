import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Ticket } from '../../../core/models/ticket';
import { TicketApiService } from '../../../core/services/ticket-api.service';
import { ToastService } from '../../../ui/toast/toast.service';
import { Alert } from '../../../ui/alert/alert';
import { Button } from '../../../ui/button/button';
import { Dialog } from '../../../ui/dialog/dialog';
import { TicketForm, buildTicketForm } from '../ticket-form/ticket-form';

@Component({
  selector: 'app-edit-ticket-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, Button, Alert, TicketForm],
  templateUrl: './edit-ticket-dialog.html',
})
export class EditTicketDialog implements OnInit {
  private readonly api = inject(TicketApiService);
  private readonly toast = inject(ToastService);

  readonly ticket = input.required<Ticket>();
  readonly saved = output<Ticket>();
  readonly closed = output<void>();

  protected readonly form = buildTicketForm();
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly conflict = signal(false);

  ngOnInit(): void {
    const ticket = this.ticket();
    this.form.setValue({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      labels: [...ticket.labels],
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    this.conflict.set(false);
    const value = this.form.getRawValue();

    this.api
      .update(this.ticket().id, {
        title: value.title,
        description: value.description,
        status: value.status,
        priority: value.priority!,
        labels: value.labels,
        concurrencyToken: this.ticket().concurrencyToken,
      })
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.toast.success('Ticket updated.');
          this.saved.emit(updated);
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          if (error.status === 409) {
            this.conflict.set(true);
          }
        },
      });
  }
}
