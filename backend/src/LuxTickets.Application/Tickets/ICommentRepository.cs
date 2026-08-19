using LuxTickets.Domain.Entities;

namespace LuxTickets.Application.Tickets;

public interface ICommentRepository
{
    Task<IReadOnlyList<Comment>> GetForTicketAsync(int ticketId, CancellationToken ct = default);

    Task AddAsync(Comment comment, CancellationToken ct = default);

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
