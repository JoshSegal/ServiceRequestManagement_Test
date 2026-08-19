import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Ticket, TicketListItem, TicketPriority, TicketStatus } from '../../../core/models/ticket';
import { TicketApiService } from '../../../core/services/ticket-api.service';
import { SortKey, TicketsStore } from '../../../core/services/tickets-store';
import { formatDate } from '../../../core/util/format';
import { ToastService } from '../../../ui/toast/toast.service';
import { Button } from '../../../ui/button/button';
import { Dialog } from '../../../ui/dialog/dialog';
import { EmptyState } from '../../../ui/empty-state/empty-state';
import { Icon } from '../../../ui/icon/icon';
import { IconButton } from '../../../ui/icon-button/icon-button';
import { Input } from '../../../ui/input/input';
import { Pagination } from '../../../ui/pagination/pagination';
import { PriorityBadge } from '../../../ui/priority-badge/priority-badge';
import { Select } from '../../../ui/select/select';
import { Skeleton } from '../../../ui/skeleton/skeleton';
import { StatusBadge } from '../../../ui/status-badge/status-badge';
import { EditTicketDialog } from '../edit-ticket-dialog/edit-ticket-dialog';
import { PRIORITY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../ticket-options';

interface SortItem {
  readonly key: SortKey;
  readonly label: string;
}

@Component({
  selector: 'app-ticket-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    IconButton,
    Icon,
    Input,
    Select,
    StatusBadge,
    PriorityBadge,
    Pagination,
    EmptyState,
    Skeleton,
    Dialog,
    EditTicketDialog,
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class TicketList implements OnInit {
  protected readonly store = inject(TicketsStore);
  private readonly api = inject(TicketApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly statusFilterOptions = STATUS_FILTER_OPTIONS;
  protected readonly priorityFilterOptions = PRIORITY_FILTER_OPTIONS;
  protected readonly formatDate = formatDate;
  protected readonly skeletonRows = Array.from({ length: 8 });

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly statusFilter = new FormControl('', { nonNullable: true });
  protected readonly priorityFilter = new FormControl('', { nonNullable: true });

  protected readonly sortOpen = signal(false);
  private readonly sortRef = viewChild<ElementRef<HTMLElement>>('sortRef');
  protected readonly sortItems: SortItem[] = [
    { key: 'newest', label: 'Newest first' },
    { key: 'oldest', label: 'Oldest first' },
    { key: 'priority', label: 'Priority (high → low)' },
    { key: 'status', label: 'Status' },
    { key: 'updated', label: 'Recently updated' },
  ];

  protected readonly editing = signal<Ticket | null>(null);
  protected readonly deleting = signal<TicketListItem | null>(null);
  protected readonly deletingBusy = signal(false);

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.store.setSearch(value));

    this.statusFilter.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.store.setStatus((value || null) as TicketStatus | null));

    this.priorityFilter.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.store.setPriority((value || null) as TicketPriority | null));
  }

  ngOnInit(): void {
    this.search.setValue(this.store.search(), { emitEvent: false });
    this.statusFilter.setValue(this.store.status() ?? '', { emitEvent: false });
    this.priorityFilter.setValue(this.store.priority() ?? '', { emitEvent: false });
    this.store.load();
  }

  protected sortLabel(): string {
    return this.sortItems.find((item) => item.key === this.store.sort())?.label ?? 'Sort';
  }

  protected toggleSort(): void {
    this.sortOpen.update((open) => !open);
  }

  protected chooseSort(key: SortKey): void {
    this.store.setSort(key);
    this.sortOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    const ref = this.sortRef();
    if (this.sortOpen() && ref && !ref.nativeElement.contains(event.target as Node)) {
      this.sortOpen.set(false);
    }
  }

  protected rangeStart(): number {
    const result = this.store.result();
    return result && result.totalCount ? (result.page - 1) * result.pageSize + 1 : 0;
  }

  protected rangeEnd(): number {
    const result = this.store.result();
    return result ? Math.min(result.page * result.pageSize, result.totalCount) : 0;
  }

  protected openEdit(item: TicketListItem): void {
    this.api.get(item.id).subscribe((ticket) => this.editing.set(ticket));
  }

  protected onSaved(): void {
    this.editing.set(null);
    this.store.load();
  }

  protected confirmDelete(): void {
    const item = this.deleting();
    if (!item) {
      return;
    }
    this.deletingBusy.set(true);
    this.api.delete(item.id).subscribe({
      next: () => {
        this.deletingBusy.set(false);
        this.deleting.set(null);
        this.toast.success('Ticket deleted.');
        this.store.load();
      },
      error: () => this.deletingBusy.set(false),
    });
  }

  protected resetFilters(): void {
    this.search.setValue('', { emitEvent: false });
    this.statusFilter.setValue('', { emitEvent: false });
    this.priorityFilter.setValue('', { emitEvent: false });
    this.store.resetFilters();
  }
}
