using LuxTickets.Api.Common;
using LuxTickets.Application.Tickets;
using Microsoft.AspNetCore.Mvc;

namespace LuxTickets.Api.Controllers;

[ApiController]
[Route("api/v1/tickets/{ticketId:int}/comments")]
[Produces("application/json")]
public sealed class CommentsController(ICommentService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CommentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<CommentDto>>> GetComments(
        int ticketId,
        CancellationToken ct) =>
        (await service.GetCommentsAsync(ticketId, ct)).ToActionResult();

    [HttpPost]
    [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CommentDto>> AddComment(
        int ticketId,
        CreateCommentRequest request,
        CancellationToken ct)
    {
        var result = await service.AddCommentAsync(ticketId, request, ct);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetComments), new { ticketId }, result.Value)
            : result.ToActionResult();
    }
}
