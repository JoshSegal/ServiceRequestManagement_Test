using LuxTickets.Domain.Enums;

namespace LuxTickets.Application.Tickets;

public sealed record TicketListItemDto(
    int Id,
    string Reference,
    string Title,
    TicketStatus Status,
    TicketPriority Priority,
    DateTimeOffset CreatedAt);
