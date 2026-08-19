import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconButton } from '../icon-button/icon-button';
import { uid } from '../uid';

@Component({
  selector: 'app-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconButton],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);

  readonly title = input.required<string>();
  readonly description = input('');
  readonly hasBody = input(true);
  readonly width = input(440);
  readonly closed = output<void>();

  protected readonly titleId = uid('dialog-title');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly previouslyFocused = this.document.activeElement as HTMLElement | null;

  ngAfterViewInit(): void {
    const panel = this.panel().nativeElement;
    const initial =
      panel.querySelector<HTMLElement>('[data-autofocus]') ?? this.focusable(panel)[0];
    initial?.focus();
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus();
  }

  protected onScrimClick(): void {
    this.closed.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closed.emit();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const items = this.focusable(this.panel().nativeElement);
    if (items.length === 0) {
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = this.document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusable(root: HTMLElement): HTMLElement[] {
    return Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }
}
