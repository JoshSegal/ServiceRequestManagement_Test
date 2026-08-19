namespace LuxTickets.Domain.Entities;

public class Label
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public required string Name { get; set; }

    public Ticket Ticket { get; set; } = null!;
}
