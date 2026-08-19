import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon, IconName } from '../icon/icon';
import { uid } from '../uid';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (label()) {
      <label class="field-label" [attr.for]="id">
        {{ label() }}
        @if (required()) {
          <span class="req" aria-hidden="true">*</span>
        }
      </label>
    }
    <div class="field" [class.has-error]="!!error()" [class.is-disabled]="disabled()">
      @if (leadingIcon(); as icon) {
        <app-icon class="leading" [name]="icon" [size]="16" />
      }
      <input
        [id]="id"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="error() || hint() ? id + '-hint' : null"
        (input)="handleInput($event)"
        (blur)="onTouched()"
      />
    </div>
    @if (error()) {
      <p class="hint is-error" [id]="id + '-hint'">{{ error() }}</p>
    } @else if (hint()) {
      <p class="hint" [id]="id + '-hint'">{{ hint() }}</p>
    }
  `,
  styleUrl: './input.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Input), multi: true }],
})
export class Input implements ControlValueAccessor {
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly placeholder = input('');
  readonly type = input('text');
  readonly leadingIcon = input<IconName | null>(null);
  readonly required = input(false);

  protected readonly id = uid('input');
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
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
