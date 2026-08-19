import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Comment,
  PagedResult,
  Ticket,
  TicketListItem,
  TicketPriority,
  TicketStatus,
} from '../models/ticket';

export interface TicketFilter {
  readonly search?: string;
  readonly status?: TicketStatus | null;
  readonly priority?: TicketPriority | null;
  readonly sortBy?: string;
  readonly sortDir?: 'asc' | 'desc';
  readonly page?: number;
  readonly pageSize?: number;
}

export interface CreateTicketPayload {
  readonly title: string;
  readonly description: string;
  readonly status?: TicketStatus | null;
  readonly priority: TicketPriority;
  readonly labels: string[];
}

export interface UpdateTicketPayload {
  readonly title: string;
  readonly description: string;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly labels: string[];
  readonly concurrencyToken: string;
}

@Injectable({ providedIn: 'root' })
export class TicketApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/tickets`;

  filter(filter: TicketFilter): Observable<PagedResult<TicketListItem>> {
    let params = new HttpParams();
    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.priority) {
      params = params.set('priority', filter.priority);
    }
    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter.sortDir) {
      params = params.set('sortDir', filter.sortDir);
    }
    if (filter.page) {
      params = params.set('page', filter.page);
    }
    if (filter.pageSize) {
      params = params.set('pageSize', filter.pageSize);
    }
    return this.http.get<PagedResult<TicketListItem>>(`${this.base}/filter`, { params });
  }

  get(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.base}/${id}`);
  }

  create(payload: CreateTicketPayload): Observable<Ticket> {
    return this.http.post<Ticket>(this.base, payload);
  }

  update(id: number, payload: UpdateTicketPayload): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  listComments(id: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}/${id}/comments`);
  }

  addComment(id: number, body: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.base}/${id}/comments`, { body });
  }
}
