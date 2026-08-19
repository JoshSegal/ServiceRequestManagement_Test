using LuxTickets.Application.Common;
using LuxTickets.Domain.Entities;
using LuxTickets.Domain.Enums;

namespace LuxTickets.Application.Tickets;

public sealed class TicketService(ITicketRepository tickets, TimeProvider clock) : ITicketService
{
    public async Task<PagedResult<TicketListItemDto>> GetTicketsAsync(
        TicketFilterRequest filter,
        CancellationToken ct = default)
    {
        var page = await tickets.GetPageAsync(filter, ct);
        var items = page.Items.Select(t => t.ToListItem()).ToList();
        return new PagedResult<TicketListItemDto>(items, page.Page, page.PageSize, page.TotalCount);
    }

    public async Task<Result<TicketDto>> GetTicketAsync(int id, CancellationToken ct = default)
    {
        var ticket = await tickets.GetWithDetailsAsync(id, ct);
        return ticket is null
            ? Result<TicketDto>.NotFound($"Ticket {id} was not found.")
            : Result<TicketDto>.Ok(ticket.ToDto());
    }

    public async Task<TicketDto> CreateTicketAsync(
        CreateTicketRequest request,
        CancellationToken ct = default)
    {
        var now = clock.GetUtcNow();
        var ticket = new Ticket
        {
            Title = request.Title.Trim(),
            Description = request.Description,
            Status = request.Status ?? TicketStatus.Open,
            Priority = request.Priority,
            Reporter = NormalizeReporter(request.Reporter),
            CreatedAt = now,
            UpdatedAt = now,
            Labels = NormalizeLabels(request.Labels),
        };

        await tickets.AddAsync(ticket, ct);
        await tickets.SaveChangesAsync(ct);
        return ticket.ToDto();
    }

    public async Task<Result<TicketDto>> UpdateTicketAsync(
        int id,
        UpdateTicketRequest request,
        CancellationToken ct = default)
    {
        var ticket = await tickets.GetForUpdateAsync(id, ct);
        if (ticket is null)
        {
            return Result<TicketDto>.NotFound($"Ticket {id} was not found.");
        }

        if (!TryDecodeToken(request.ConcurrencyToken, out var originalRowVersion))
        {
            return Result<TicketDto>.Conflict("Invalid concurrency token.");
        }

        ticket.Title = request.Title.Trim();
        ticket.Description = request.Description;
        ticket.Status = request.Status;
        ticket.Priority = request.Priority;
        ticket.UpdatedAt = clock.GetUtcNow();
        ReplaceLabels(ticket, request.Labels);

        try
        {
            await tickets.SaveWithConcurrencyAsync(ticket, originalRowVersion, ct);
        }
        catch (ConcurrencyConflictException)
        {
            return Result<TicketDto>.Conflict(
                "The ticket was modified by someone else. Reload and try again.");
        }

        return Result<TicketDto>.Ok(ticket.ToDto());
    }

    public async Task<Result<bool>> DeleteTicketAsync(int id, CancellationToken ct = default)
    {
        var ticket = await tickets.GetByIdAsync(id, ct);
        if (ticket is null)
        {
            return Result<bool>.NotFound($"Ticket {id} was not found.");
        }

        tickets.Remove(ticket);
        await tickets.SaveChangesAsync(ct);
        return Result<bool>.Ok(true);
    }

    private static string NormalizeReporter(string? reporter) =>
        string.IsNullOrWhiteSpace(reporter) ? "Unassigned" : reporter.Trim();

    private static void ReplaceLabels(Ticket ticket, IReadOnlyList<string>? labels)
    {
        ticket.Labels.Clear();
        foreach (var label in NormalizeLabels(labels))
        {
            ticket.Labels.Add(label);
        }
    }

    private static List<Label> NormalizeLabels(IReadOnlyList<string>? labels) =>
        labels is null
            ? []
            : labels
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .Select(l => l.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Select(name => new Label { Name = name })
                .ToList();

    private static bool TryDecodeToken(string token, out byte[] bytes)
    {
        bytes = [];
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        try
        {
            bytes = Convert.FromBase64String(token);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
