import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AlertVariant = 'error' | 'info';

@Component({
  selector: 'app-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './alert.scss',
  host: {
    role: 'alert',
    '[attr.data-variant]': 'variant()',
  },
})
export class Alert {
  readonly variant = input<AlertVariant>('error');
}
