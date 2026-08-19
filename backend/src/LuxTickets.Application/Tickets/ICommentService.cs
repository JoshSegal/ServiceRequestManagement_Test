using LuxTickets.Application.Common;

namespace LuxTickets.Application.Tickets;

public interface ICommentService
{
    Task<Result<IReadOnlyList<CommentDto>>> GetCommentsAsync(int ticketId, CancellationToken ct = default);

    Task<Result<CommentDto>> AddCommentAsync(
        int ticketId,
        CreateCommentRequest request,
        CancellationToken ct = default);
}
