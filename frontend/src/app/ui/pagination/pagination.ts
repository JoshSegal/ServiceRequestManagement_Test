import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button } from '../button/button';

type PageItem = number | 'ellipsis';

function buildPages(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const wanted = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    wanted.add(2).add(3);
  }
  if (current >= total - 2) {
    wanted.add(total - 1).add(total - 2);
  }

  const sorted = [...wanted].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const result: PageItem[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) {
      result.push('ellipsis');
    }
    result.push(page);
    previous = page;
  }
  return result;
}

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  template: `
    <nav class="pagination" aria-label="Pagination">
      <button
        app-button
        variant="outline"
        size="sm"
        [disabled]="page() <= 1"
        (click)="go(page() - 1)"
      >
        Previous
      </button>

      @for (item of items(); track $index) {
        @if (item === 'ellipsis') {
          <span class="ellipsis" aria-hidden="true">…</span>
        } @else {
          <button
            app-button
            [variant]="item === page() ? 'default' : 'ghost'"
            size="sm"
            [attr.aria-current]="item === page() ? 'page' : null"
            [attr.aria-label]="'Page ' + item"
            (click)="go(item)"
          >
            {{ item }}
          </button>
        }
      }

      <button
        app-button
        variant="outline"
        size="sm"
        [disabled]="page() >= totalPages()"
        (click)="go(page() + 1)"
      >
        Next
      </button>
    </nav>
  `,
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly items = computed(() => buildPages(this.page(), this.totalPages()));

  protected go(target: number): void {
    if (target >= 1 && target <= this.totalPages() && target !== this.page()) {
      this.pageChange.emit(target);
    }
  }
}
