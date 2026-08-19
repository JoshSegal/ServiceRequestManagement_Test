import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUS_LABELS, TicketStatus } from '../../core/models/ticket';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ label() }}`,
  styleUrl: './status-badge.scss',
  host: {
    '[attr.data-status]': 'status()',
  },
})
export class StatusBadge {
  readonly status = input.required<TicketStatus>();
  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
}
