import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';
import { uid } from '../uid';

@Component({
  selector: 'app-labels-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './labels-input.html',
  styleUrl: './labels-input.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabelsInput), multi: true },
  ],
})
export class LabelsInput implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('Add labels…');

  protected readonly id = uid('labels');
  protected readonly labels = signal<string[]>([]);
  protected readonly disabled = signal(false);
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  private onChange: (value: string[]) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.labels.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.add(input.value);
      input.value = '';
    } else if (event.key === 'Backspace' && input.value === '' && this.labels().length > 0) {
      this.removeAt(this.labels().length - 1);
    }
  }

  protected commit(): void {
    const input = this.inputRef().nativeElement;
    if (input.value.trim()) {
      this.add(input.value);
      input.value = '';
    }
  }

  protected remove(label: string): void {
    this.labels.update((current) => current.filter((item) => item !== label));
    this.onChange(this.labels());
  }

  protected focusInput(): void {
    this.inputRef().nativeElement.focus();
  }

  private add(raw: string): void {
    const value = raw.trim();
    if (!value || this.labels().some((item) => item.toLowerCase() === value.toLowerCase())) {
      return;
    }
    this.labels.update((current) => [...current, value]);
    this.onChange(this.labels());
  }

  private removeAt(index: number): void {
    this.labels.update((current) => current.filter((_, i) => i !== index));
    this.onChange(this.labels());
  }
}
