using LuxTickets.Api.Common;
using LuxTickets.Application.Common;
using LuxTickets.Application.Tickets;
using Microsoft.AspNetCore.Mvc;

namespace LuxTickets.Api.Controllers;

[ApiController]
[Route("api/v1/tickets")]
[Produces("application/json")]
public sealed class TicketsController(ITicketService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TicketListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<TicketListItemDto>>> GetTickets(
        [FromQuery] TicketFilterRequest filter,
        CancellationToken ct) =>
        Ok(await service.GetTicketsAsync(filter, ct));

    // Filtering endpoint that drives the list screen: search, status/priority, sort, paging.
    [HttpGet("filter")]
    [ProducesResponseType(typeof(PagedResult<TicketListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<TicketListItemDto>>> FilterTickets(
        [FromQuery] TicketFilterRequest filter,
        CancellationToken ct) =>
        Ok(await service.GetTicketsAsync(filter, ct));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> GetTicket(int id, CancellationToken ct) =>
        (await service.GetTicketAsync(id, ct)).ToActionResult();

    [HttpPost]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketRequest request, CancellationToken ct)
    {
        var dto = await service.CreateTicketAsync(request, ct);
        return CreatedAtAction(nameof(GetTicket), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TicketDto>> UpdateTicket(
        int id,
        UpdateTicketRequest request,
        CancellationToken ct) =>
        (await service.UpdateTicketAsync(id, request, ct)).ToActionResult();

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTicket(int id, CancellationToken ct)
    {
        var result = await service.DeleteTicketAsync(id, ct);
        return result.Status switch
        {
            ResultStatus.Ok => NoContent(),
            ResultStatus.NotFound => NotFound(new ProblemDetails
            {
                Detail = result.Error,
                Status = StatusCodes.Status404NotFound,
                Title = "Not Found",
            }),
            _ => Problem(),
        };
    }
}
