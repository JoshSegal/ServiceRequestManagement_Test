import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketPriority, TicketStatus } from '../../../core/models/ticket';
import { Input } from '../../../ui/input/input';
import { LabelsInput } from '../../../ui/labels-input/labels-input';
import { Select } from '../../../ui/select/select';
import { Textarea } from '../../../ui/textarea/textarea';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../ticket-options';

export type TicketFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  status: FormControl<TicketStatus>;
  priority: FormControl<TicketPriority | null>;
  labels: FormControl<string[]>;
}>;

export interface TicketFormInitial {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority | null;
  labels?: string[];
}

export function buildTicketForm(initial: TicketFormInitial = {}): TicketFormGroup {
  return new FormGroup({
    title: new FormControl(initial.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    description: new FormControl(initial.description ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<TicketStatus>(initial.status ?? 'Open', { nonNullable: true }),
    priority: new FormControl<TicketPriority | null>(initial.priority ?? null, {
      validators: [Validators.required],
    }),
    labels: new FormControl<string[]>(initial.labels ?? [], { nonNullable: true }),
  });
}

@Component({
  selector: 'app-ticket-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Input, Textarea, Select, LabelsInput],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss',
})
export class TicketForm {
  readonly form = input.required<TicketFormGroup>();
  readonly submitted = input(false);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly priorityOptions = PRIORITY_OPTIONS;

  protected titleError(): string {
    return this.showError('title') ? 'Title is required.' : '';
  }

  protected descriptionError(): string {
    return this.showError('description') ? 'Description is required.' : '';
  }

  protected priorityError(): string {
    return this.showError('priority') ? 'Priority is required.' : '';
  }

  private showError(name: string): boolean {
    const control = this.form().get(name);
    return !!control && control.invalid && (control.touched || this.submitted());
  }
}
