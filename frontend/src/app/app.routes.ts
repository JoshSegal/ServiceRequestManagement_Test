import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tickets', pathMatch: 'full' },
  {
    path: 'tickets',
    title: 'Tickets',
    loadComponent: () =>
      import('./features/tickets/ticket-list/ticket-list').then((m) => m.TicketList),
  },
  {
    path: 'tickets/new',
    title: 'Create ticket',
    loadComponent: () =>
      import('./features/tickets/ticket-create/ticket-create').then((m) => m.TicketCreate),
  },
  {
    path: 'tickets/:id',
    title: 'Ticket',
    loadComponent: () =>
      import('./features/tickets/ticket-detail/ticket-detail').then((m) => m.TicketDetail),
  },
  { path: '**', redirectTo: 'tickets' },
];
