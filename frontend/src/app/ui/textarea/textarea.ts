import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { uid } from '../uid';

@Component({
  selector: 'app-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <label class="field-label" [attr.for]="id">
        {{ label() }}
        @if (required()) {
          <span class="req" aria-hidden="true">*</span>
        }
      </label>
    }
    <textarea
      [id]="id"
      class="field"
      [class.has-error]="!!error()"
      [placeholder]="placeholder()"
      [rows]="rows()"
      [value]="value()"
      [disabled]="disabled()"
      [attr.aria-invalid]="!!error()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-describedby]="error() || hint() ? id + '-hint' : null"
      (input)="handleInput($event)"
      (blur)="onTouched()"
    ></textarea>
    @if (error()) {
      <p class="hint is-error" [id]="id + '-hint'">{{ error() }}</p>
    } @else if (hint()) {
      <p class="hint" [id]="id + '-hint'">{{ hint() }}</p>
    }
  `,
  styleUrl: './textarea.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Textarea), multi: true }],
})
export class Textarea implements ControlValueAccessor {
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly placeholder = input('');
  readonly rows = input(4);
  readonly ariaLabel = input('');
  readonly required = input(false);

  protected readonly id = uid('textarea');
  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
