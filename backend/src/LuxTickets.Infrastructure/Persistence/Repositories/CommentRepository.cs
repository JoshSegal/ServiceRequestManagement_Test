using LuxTickets.Application.Tickets;
using LuxTickets.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LuxTickets.Infrastructure.Persistence.Repositories;

public sealed class CommentRepository(LuxTicketsDbContext context) : ICommentRepository
{
    public async Task<IReadOnlyList<Comment>> GetForTicketAsync(
        int ticketId,
        CancellationToken ct = default) =>
        await context.Comments.AsNoTracking()
            .Where(c => c.TicketId == ticketId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Comment comment, CancellationToken ct = default) =>
        await context.Comments.AddAsync(comment, ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        context.SaveChangesAsync(ct);
}
