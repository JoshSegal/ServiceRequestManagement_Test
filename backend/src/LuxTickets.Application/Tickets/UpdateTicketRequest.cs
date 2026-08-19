using LuxTickets.Domain.Enums;

namespace LuxTickets.Application.Tickets;

public sealed record UpdateTicketRequest(
    string Title,
    string Description,
    TicketStatus Status,
    TicketPriority Priority,
    IReadOnlyList<string>? Labels,
    string ConcurrencyToken);
