using LuxTickets.Application.Common;
using LuxTickets.Application.Tickets;
using LuxTickets.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LuxTickets.Infrastructure.Persistence.Repositories;

public sealed class TicketRepository(LuxTicketsDbContext context) : ITicketRepository
{
    public async Task<PagedResult<Ticket>> GetPageAsync(
        TicketFilterRequest filter,
        CancellationToken ct = default)
    {
        var page = Pagination.ClampPage(filter.Page);
        var pageSize = Pagination.ClampPageSize(filter.PageSize);

        var query = context.Tickets.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = $"%{filter.Search.Trim()}%";
            query = query.Where(t =>
                EF.Functions.Like(t.Title, term)
                || EF.Functions.Like(t.Description, term)
                || t.Labels.Any(l => EF.Functions.Like(l.Name, term)));
        }

        if (filter.Status is { } status)
        {
            query = query.Where(t => t.Status == status);
        }

        if (filter.Priority is { } priority)
        {
            query = query.Where(t => t.Priority == priority);
        }

        var descending = !string.Equals(filter.SortDir, "asc", StringComparison.OrdinalIgnoreCase);

        // Only sort by a known column so client input can never drive the OrderBy.
        var sorted = filter.SortBy?.ToLowerInvariant() switch
        {
            "updated" => descending ? query.OrderByDescending(t => t.UpdatedAt) : query.OrderBy(t => t.UpdatedAt),
            "priority" => descending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "status" => descending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "title" => descending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            _ => descending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
        };

        var total = await sorted.CountAsync(ct);
        var items = await sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Ticket>(items, page, pageSize, total);
    }

    public async Task<Ticket?> GetWithDetailsAsync(int id, CancellationToken ct = default) =>
        await context.Tickets.AsNoTracking()
            .Include(t => t.Labels)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<Ticket?> GetForUpdateAsync(int id, CancellationToken ct = default) =>
        await context.Tickets.Include(t => t.Labels).FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<Ticket?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await context.Tickets.FindAsync([id], ct);

    public async Task AddAsync(Ticket ticket, CancellationToken ct = default) =>
        await context.Tickets.AddAsync(ticket, ct);

    public void Remove(Ticket ticket) => context.Tickets.Remove(ticket);

    public async Task SaveWithConcurrencyAsync(
        Ticket ticket,
        byte[] originalRowVersion,
        CancellationToken ct = default)
    {
        context.Entry(ticket).Property(t => t.RowVersion).OriginalValue = originalRowVersion;
        try
        {
            await context.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new ConcurrencyConflictException("The ticket was modified concurrently.", ex);
        }
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        context.SaveChangesAsync(ct);
}
