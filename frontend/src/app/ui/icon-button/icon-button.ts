import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'button[app-icon-button], a[app-icon-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `<app-icon [name]="icon()" [size]="16" />`,
  styleUrl: './icon-button.scss',
  host: {
    '[attr.disabled]': 'disabled() ? "" : null',
  },
})
export class IconButton {
  readonly icon = input.required<IconName>();
  readonly disabled = input(false);
}
