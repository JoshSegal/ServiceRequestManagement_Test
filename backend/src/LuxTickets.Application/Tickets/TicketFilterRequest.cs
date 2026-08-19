using LuxTickets.Domain.Enums;

namespace LuxTickets.Application.Tickets;

public sealed record TicketFilterRequest
{
    public string? Search { get; init; }
    public TicketStatus? Status { get; init; }
    public TicketPriority? Priority { get; init; }
    public string? SortBy { get; init; }
    public string? SortDir { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}
