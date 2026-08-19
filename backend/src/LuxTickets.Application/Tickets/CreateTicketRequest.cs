using LuxTickets.Domain.Enums;

namespace LuxTickets.Application.Tickets;

public sealed record CreateTicketRequest(
    string Title,
    string Description,
    TicketStatus? Status,
    TicketPriority Priority,
    IReadOnlyList<string>? Labels,
    string? Reporter);
