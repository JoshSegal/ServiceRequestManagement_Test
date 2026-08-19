import { Injectable, computed, inject, signal } from '@angular/core';
import { PagedResult, TicketListItem, TicketPriority, TicketStatus } from '../models/ticket';
import { TicketApiService } from './ticket-api.service';

export type SortKey = 'newest' | 'oldest' | 'priority' | 'status' | 'updated';

interface SortOption {
  readonly sortBy: string;
  readonly sortDir: 'asc' | 'desc';
}

const SORTS: Record<SortKey, SortOption> = {
  newest: { sortBy: 'created', sortDir: 'desc' },
  oldest: { sortBy: 'created', sortDir: 'asc' },
  priority: { sortBy: 'priority', sortDir: 'desc' },
  status: { sortBy: 'status', sortDir: 'asc' },
  updated: { sortBy: 'updated', sortDir: 'desc' },
};

const PAGE_SIZE = 8;

@Injectable({ providedIn: 'root' })
export class TicketsStore {
  private readonly api = inject(TicketApiService);

  private requestSeq = 0;

  readonly search = signal('');
  readonly status = signal<TicketStatus | null>(null);
  readonly priority = signal<TicketPriority | null>(null);
  readonly sort = signal<SortKey>('newest');
  readonly page = signal(1);

  readonly result = signal<PagedResult<TicketListItem> | null>(null);
  readonly loading = signal(false);
  readonly failed = signal(false);

  readonly hasActiveFilters = computed(
    () => this.search().length > 0 || this.status() !== null || this.priority() !== null,
  );

  load(): void {
    const seq = ++this.requestSeq;
    this.loading.set(true);
    this.failed.set(false);
    const { sortBy, sortDir } = SORTS[this.sort()];

    this.api
      .filter({
        search: this.search(),
        status: this.status(),
        priority: this.priority(),
        sortBy,
        sortDir,
        page: this.page(),
        pageSize: PAGE_SIZE,
      })
      .subscribe({
        next: (result) => {
          if (seq !== this.requestSeq) {
            return;
          }
          this.result.set(result);
          this.loading.set(false);
        },
        error: () => {
          if (seq !== this.requestSeq) {
            return;
          }
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }

  setSearch(value: string): void {
    this.search.set(value);
    this.resetToFirstPage();
  }

  setStatus(value: TicketStatus | null): void {
    this.status.set(value);
    this.resetToFirstPage();
  }

  setPriority(value: TicketPriority | null): void {
    this.priority.set(value);
    this.resetToFirstPage();
  }

  setSort(value: SortKey): void {
    this.sort.set(value);
    this.resetToFirstPage();
  }

  setPage(value: number): void {
    this.page.set(value);
    this.load();
  }

  resetFilters(): void {
    this.search.set('');
    this.status.set(null);
    this.priority.set(null);
    this.sort.set('newest');
    this.resetToFirstPage();
  }

  private resetToFirstPage(): void {
    this.page.set(1);
    this.load();
  }
}
