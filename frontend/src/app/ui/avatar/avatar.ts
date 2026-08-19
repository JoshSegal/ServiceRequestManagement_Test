import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ initials() }}`,
  styleUrl: './avatar.scss',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.title]': 'name()',
    '[attr.aria-label]': 'name()',
    role: 'img',
  },
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md'>('md');

  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join(''),
  );
}
