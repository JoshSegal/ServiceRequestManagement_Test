using LuxTickets.Domain.Enums;

namespace LuxTickets.Domain.Entities;

public class Ticket
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public string? Reporter { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public byte[] RowVersion { get; set; } = [];

    public List<Label> Labels { get; set; } = [];
    public List<Comment> Comments { get; set; } = [];
}
