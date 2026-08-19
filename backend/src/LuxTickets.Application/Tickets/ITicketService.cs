using LuxTickets.Application.Common;

namespace LuxTickets.Application.Tickets;

public interface ITicketService
{
    Task<PagedResult<TicketListItemDto>> GetTicketsAsync(
        TicketFilterRequest filter,
        CancellationToken ct = default);

    Task<Result<TicketDto>> GetTicketAsync(int id, CancellationToken ct = default);

    Task<TicketDto> CreateTicketAsync(CreateTicketRequest request, CancellationToken ct = default);

    Task<Result<TicketDto>> UpdateTicketAsync(
        int id,
        UpdateTicketRequest request,
        CancellationToken ct = default);

    Task<Result<bool>> DeleteTicketAsync(int id, CancellationToken ct = default);
}
