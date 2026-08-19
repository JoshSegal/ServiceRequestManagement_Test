using LuxTickets.Domain.Entities;

namespace LuxTickets.Application.Tickets;

public static class TicketMappings
{
    public static string Reference(int id) => $"LUX-{id}";

    public static TicketListItemDto ToListItem(this Ticket t) =>
        new(t.Id, Reference(t.Id), t.Title, t.Status, t.Priority, t.CreatedAt);

    public static TicketDto ToDto(this Ticket t) =>
        new(
            t.Id,
            Reference(t.Id),
            t.Title,
            t.Description,
            t.Status,
            t.Priority,
            t.Reporter,
            t.Labels.Select(l => l.Name).ToList(),
            t.CreatedAt,
            t.UpdatedAt,
            Convert.ToBase64String(t.RowVersion));
}
