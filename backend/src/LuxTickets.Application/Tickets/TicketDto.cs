using LuxTickets.Domain.Enums;

namespace LuxTickets.Application.Tickets;

public sealed record TicketDto(
    int Id,
    string Reference,
    string Title,
    string Description,
    TicketStatus Status,
    TicketPriority Priority,
    string? Reporter,
    IReadOnlyList<string> Labels,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    string ConcurrencyToken);
