using LuxTickets.Application.Common;
using LuxTickets.Domain.Entities;

namespace LuxTickets.Application.Tickets;

public sealed class CommentService(
    ICommentRepository comments,
    ITicketRepository tickets,
    TimeProvider clock) : ICommentService
{
    public async Task<Result<IReadOnlyList<CommentDto>>> GetCommentsAsync(
        int ticketId,
        CancellationToken ct = default)
    {
        if (await tickets.GetByIdAsync(ticketId, ct) is null)
        {
            return Result<IReadOnlyList<CommentDto>>.NotFound($"Ticket {ticketId} was not found.");
        }

        var list = await comments.GetForTicketAsync(ticketId, ct);
        return Result<IReadOnlyList<CommentDto>>.Ok(list.Select(c => c.ToDto()).ToList());
    }

    public async Task<Result<CommentDto>> AddCommentAsync(
        int ticketId,
        CreateCommentRequest request,
        CancellationToken ct = default)
    {
        if (await tickets.GetByIdAsync(ticketId, ct) is null)
        {
            return Result<CommentDto>.NotFound($"Ticket {ticketId} was not found.");
        }

        var comment = new Comment
        {
            TicketId = ticketId,
            Body = request.Body.Trim(),
            Author = "You",
            CreatedAt = clock.GetUtcNow(),
        };

        await comments.AddAsync(comment, ct);
        await comments.SaveChangesAsync(ct);
        return Result<CommentDto>.Ok(comment.ToDto());
    }
}
