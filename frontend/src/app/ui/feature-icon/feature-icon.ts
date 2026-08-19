import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-feature-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `<app-icon [name]="icon()" [size]="18" />`,
  styleUrl: './feature-icon.scss',
})
export class FeatureIcon {
  readonly icon = input<IconName>('ticket');
}
