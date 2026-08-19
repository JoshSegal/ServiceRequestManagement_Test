namespace LuxTickets.Domain.Entities;

public class Comment
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public required string Body { get; set; }
    public string? Author { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Ticket Ticket { get; set; } = null!;
}
