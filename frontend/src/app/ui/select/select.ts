import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';
import { uid } from '../uid';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly dotColor?: string;
}

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true }],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Select implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly options = input<readonly SelectOption[]>([]);
  readonly placeholder = input('Select…');
  readonly ariaLabel = input<string>('');
  readonly label = input('');
  readonly error = input('');
  readonly required = input(false);

  protected readonly id = uid('select');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal(false);

  protected readonly selected = computed(() => {
    const value = this.value();
    return value ? (this.options().find((option) => option.value === value) ?? null) : null;
  });

  private onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected optionId(index: number): string {
    return `${this.id}-opt-${index}`;
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openMenu();
    }
  }

  protected select(option: SelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.openMenu();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectActive();
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
      default:
        break;
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private openMenu(): void {
    this.open.set(true);
    const current = this.options().findIndex((option) => option.value === this.value());
    this.activeIndex.set(current >= 0 ? current : 0);
  }

  private close(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.activeIndex.set(-1);
    this.onTouched();
  }

  private move(delta: number): void {
    const count = this.options().length;
    if (count === 0) {
      return;
    }
    const next = (this.activeIndex() + delta + count) % count;
    this.activeIndex.set(next);
  }

  private selectActive(): void {
    const option = this.options()[this.activeIndex()];
    if (option) {
      this.select(option);
    }
  }
}
