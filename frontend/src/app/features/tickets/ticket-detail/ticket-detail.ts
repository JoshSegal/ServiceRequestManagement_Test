import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Comment, Ticket } from '../../../core/models/ticket';
import { TicketApiService } from '../../../core/services/ticket-api.service';
import { formatDateTime, formatRelative } from '../../../core/util/format';
import { MarkdownPipe } from '../../../core/util/markdown.pipe';
import { ToastService } from '../../../ui/toast/toast.service';
import { Button } from '../../../ui/button/button';
import { Dialog } from '../../../ui/dialog/dialog';
import { Icon } from '../../../ui/icon/icon';
import { IconButton } from '../../../ui/icon-button/icon-button';
import { PriorityBadge } from '../../../ui/priority-badge/priority-badge';
import { Skeleton } from '../../../ui/skeleton/skeleton';
import { StatusBadge } from '../../../ui/status-badge/status-badge';
import { Textarea } from '../../../ui/textarea/textarea';
import { EditTicketDialog } from '../edit-ticket-dialog/edit-ticket-dialog';

@Component({
  selector: 'app-ticket-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    IconButton,
    Icon,
    StatusBadge,
    PriorityBadge,
    Dialog,
    Skeleton,
    Textarea,
    EditTicketDialog,
    MarkdownPipe,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TicketApiService);
  private readonly toast = inject(ToastService);

  protected readonly ticket = signal<Ticket | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly editing = signal(false);
  protected readonly deleting = signal(false);
  protected readonly busy = signal(false);

  protected readonly comments = signal<Comment[]>([]);
  protected readonly commentsLoading = signal(true);
  protected readonly posting = signal(false);
  protected readonly draft = new FormControl('', { nonNullable: true });

  protected readonly formatDateTime = formatDateTime;
  protected readonly formatRelative = formatRelative;

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        takeUntilDestroyed(),
      )
      .subscribe((id) => this.load(id));
  }

  protected onSaved(updated: Ticket): void {
    this.ticket.set(updated);
    this.editing.set(false);
  }

  protected markResolved(): void {
    const ticket = this.ticket();
    if (!ticket || ticket.status === 'Resolved') {
      return;
    }

    this.busy.set(true);
    this.api
      .update(ticket.id, {
        title: ticket.title,
        description: ticket.description,
        status: 'Resolved',
        priority: ticket.priority,
        labels: [...ticket.labels],
        concurrencyToken: ticket.concurrencyToken,
      })
      .subscribe({
        next: (updated) => {
          this.busy.set(false);
          this.ticket.set(updated);
          this.toast.success('Ticket marked resolved.');
        },
        error: () => this.busy.set(false),
      });
  }

  protected confirmDelete(): void {
    const ticket = this.ticket();
    if (!ticket) {
      return;
    }

    this.busy.set(true);
    this.api.delete(ticket.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.deleting.set(false);
        this.toast.success('Ticket deleted.');
        void this.router.navigate(['/tickets']);
      },
      error: () => this.busy.set(false),
    });
  }

  protected postComment(): void {
    const ticket = this.ticket();
    const body = this.draft.value.trim();
    if (!ticket || !body) {
      return;
    }

    this.posting.set(true);
    this.api.addComment(ticket.id, body).subscribe({
      next: (comment) => {
        this.comments.update((list) => [...list, comment]);
        this.draft.reset('');
        this.posting.set(false);
      },
      error: () => this.posting.set(false),
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.api.get(id).subscribe({
      next: (ticket) => {
        this.ticket.set(ticket);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 404) {
          this.notFound.set(true);
        }
      },
    });
    this.loadComments(id);
  }

  private loadComments(id: number): void {
    this.commentsLoading.set(true);
    this.api.listComments(id).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      },
      error: () => this.commentsLoading.set(false),
    });
  }
}
