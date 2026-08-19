using LuxTickets.Application.Common;
using LuxTickets.Domain.Entities;

namespace LuxTickets.Application.Tickets;

public interface ITicketRepository
{
    Task<PagedResult<Ticket>> GetPageAsync(TicketFilterRequest filter, CancellationToken ct = default);

    Task<Ticket?> GetWithDetailsAsync(int id, CancellationToken ct = default);

    Task<Ticket?> GetForUpdateAsync(int id, CancellationToken ct = default);

    Task<Ticket?> GetByIdAsync(int id, CancellationToken ct = default);

    Task AddAsync(Ticket ticket, CancellationToken ct = default);

    void Remove(Ticket ticket);

    Task SaveWithConcurrencyAsync(Ticket ticket, byte[] originalRowVersion, CancellationToken ct = default);

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
