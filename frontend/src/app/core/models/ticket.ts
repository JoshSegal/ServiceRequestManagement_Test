export type TicketStatus = 'Open' | 'InProgress' | 'InReview' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export const TICKET_STATUSES: readonly TicketStatus[] = [
  'Open',
  'InProgress',
  'InReview',
  'Resolved',
  'Closed',
];

export const TICKET_PRIORITIES: readonly TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  InReview: 'In Review',
  Resolved: 'Resolved',
  Closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Urgent: 'Urgent',
};

export interface TicketListItem {
  readonly id: number;
  readonly reference: string;
  readonly title: string;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly createdAt: string;
}

export interface Ticket {
  readonly id: number;
  readonly reference: string;
  readonly title: string;
  readonly description: string;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly reporter: string | null;
  readonly labels: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly concurrencyToken: string;
}

export interface Comment {
  readonly id: number;
  readonly ticketId: number;
  readonly body: string;
  readonly author: string | null;
  readonly createdAt: string;
}

export interface PagedResult<T> {
  readonly items: T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}
