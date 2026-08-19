using FluentAssertions;
using LuxTickets.Application.Common;
using LuxTickets.Application.Tickets;
using LuxTickets.Domain.Entities;
using LuxTickets.Domain.Enums;
using LuxTickets.UnitTests.TestDoubles;
using NSubstitute;
using Xunit;

namespace LuxTickets.UnitTests.Tickets;

public class TicketServiceTests
{
    private static readonly DateTimeOffset Now = new(2026, 8, 15, 12, 0, 0, TimeSpan.Zero);
    private readonly ITicketRepository _repo = Substitute.For<ITicketRepository>();
    private readonly TicketService _sut;

    public TicketServiceTests() => _sut = new TicketService(_repo, new FixedTimeProvider(Now));

    [Fact]
    public async Task Create_applies_defaults_and_normalises_labels()
    {
        Ticket? captured = null;
        _repo.AddAsync(Arg.Do<Ticket>(t => captured = t), Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var request = new CreateTicketRequest(
            Title: "  Broken export  ",
            Description: "desc",
            Status: null,
            Priority: TicketPriority.High,
            Labels: ["billing", " billing ", "Backend", ""],
            Reporter: null);

        var dto = await _sut.CreateTicketAsync(request);

        captured.Should().NotBeNull();
        captured!.Title.Should().Be("Broken export");
        captured.Status.Should().Be(TicketStatus.Open);
        captured.Priority.Should().Be(TicketPriority.High);
        captured.Reporter.Should().Be("Unassigned");
        captured.CreatedAt.Should().Be(Now);
        captured.UpdatedAt.Should().Be(Now);
        captured.Labels.Select(l => l.Name).Should().Equal("billing", "Backend");
        dto.Title.Should().Be("Broken export");
        await _repo.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Get_returns_not_found_when_missing()
    {
        _repo.GetWithDetailsAsync(99, Arg.Any<CancellationToken>()).Returns((Ticket?)null);

        var result = await _sut.GetTicketAsync(99);

        result.Status.Should().Be(ResultStatus.NotFound);
    }

    [Fact]
    public async Task Update_returns_not_found_when_missing()
    {
        _repo.GetForUpdateAsync(1, Arg.Any<CancellationToken>()).Returns((Ticket?)null);

        var result = await _sut.UpdateTicketAsync(1, ValidUpdate());

        result.Status.Should().Be(ResultStatus.NotFound);
    }

    [Fact]
    public async Task Update_rejects_invalid_concurrency_token()
    {
        _repo.GetForUpdateAsync(1, Arg.Any<CancellationToken>()).Returns(SampleTicket());

        var result = await _sut.UpdateTicketAsync(1, ValidUpdate() with { ConcurrencyToken = "not-base64!!" });

        result.Status.Should().Be(ResultStatus.Conflict);
    }

    [Fact]
    public async Task Update_maps_repository_conflict_to_result()
    {
        _repo.GetForUpdateAsync(1, Arg.Any<CancellationToken>()).Returns(SampleTicket());
        _repo.SaveWithConcurrencyAsync(Arg.Any<Ticket>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException(new ConcurrencyConflictException("conflict", new InvalidOperationException())));

        var result = await _sut.UpdateTicketAsync(1, ValidUpdate());

        result.Status.Should().Be(ResultStatus.Conflict);
    }

    [Fact]
    public async Task Update_succeeds_and_applies_changes()
    {
        var ticket = SampleTicket();
        _repo.GetForUpdateAsync(1, Arg.Any<CancellationToken>()).Returns(ticket);
        _repo.SaveWithConcurrencyAsync(Arg.Any<Ticket>(), Arg.Any<byte[]>(), Arg.Any<CancellationToken>())
            .Returns(Task.CompletedTask);

        var request = new UpdateTicketRequest(
            "New title", "New desc", TicketStatus.Resolved, TicketPriority.Urgent,
            ["x"], Convert.ToBase64String([1, 2, 3]));

        var result = await _sut.UpdateTicketAsync(1, request);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Title.Should().Be("New title");
        ticket.Status.Should().Be(TicketStatus.Resolved);
        ticket.UpdatedAt.Should().Be(Now);
        ticket.Labels.Select(l => l.Name).Should().Equal("x");
    }

    [Fact]
    public async Task Delete_returns_not_found_when_missing()
    {
        _repo.GetByIdAsync(5, Arg.Any<CancellationToken>()).Returns((Ticket?)null);

        (await _sut.DeleteTicketAsync(5)).Status.Should().Be(ResultStatus.NotFound);
    }

    [Fact]
    public async Task Delete_removes_and_saves()
    {
        var ticket = SampleTicket();
        _repo.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(ticket);

        var result = await _sut.DeleteTicketAsync(1);

        result.IsSuccess.Should().BeTrue();
        _repo.Received(1).Remove(ticket);
        await _repo.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    private static Ticket SampleTicket() =>
        new()
        {
            Title = "Old",
            Description = "old",
            Status = TicketStatus.Open,
            Priority = TicketPriority.Low,
            Reporter = "Someone",
            CreatedAt = Now.AddDays(-1),
            UpdatedAt = Now.AddDays(-1),
            RowVersion = [9, 9],
            Labels = [new Label { Name = "old" }],
        };

    private static UpdateTicketRequest ValidUpdate() =>
        new("T", "D", TicketStatus.Open, TicketPriority.Medium, null, Convert.ToBase64String([1]));
}
