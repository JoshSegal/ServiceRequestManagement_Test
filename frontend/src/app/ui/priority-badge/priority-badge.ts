import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PRIORITY_LABELS, TicketPriority } from '../../core/models/ticket';

@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="dot" aria-hidden="true"></span>
    {{ label() }}
  `,
  styleUrl: './priority-badge.scss',
  host: {
    '[attr.data-priority]': 'priority()',
  },
})
export class PriorityBadge {
  readonly priority = input.required<TicketPriority>();
  protected readonly label = computed(() => PRIORITY_LABELS[this.priority()]);
}
