using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using LuxTickets.Application.Common;
using LuxTickets.Application.Tickets;
using LuxTickets.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace LuxTickets.IntegrationTests;

public sealed class TicketsApiTests(SqlServerFixture fixture) : IntegrationTestBase(fixture)
{
    private static readonly JsonSerializerOptions Json =
        new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    [Fact]
    public async Task Create_then_get_roundtrips()
    {
        var post = await Client.PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "Test ticket",
            description = "desc",
            priority = "High",
            labels = new[] { "billing" },
        });

        post.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await post.Content.ReadFromJsonAsync<TicketDto>(Json);
        created!.Reference.Should().StartWith("LUX-");
        created.Status.Should().Be(TicketStatus.Open);
        created.Labels.Should().Equal("billing");

        var get = await Client.GetAsync($"/api/v1/tickets/{created.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Get_missing_returns_404()
    {
        (await Client.GetAsync("/api/v1/tickets/999999")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_invalid_returns_400_problem_with_field_errors()
    {
        var post = await Client.PostAsJsonAsync("/api/v1/tickets", new
        {
            title = "",
            description = "",
            priority = "High",
        });

        post.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var problem = await post.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        problem!.Errors.Should().ContainKey("Title");
        problem.Errors.Should().ContainKey("Description");
    }

    [Fact]
    public async Task Filter_pages_and_filters_by_status()
    {
        await Create("Open A", TicketStatus.Open, TicketPriority.Low);
        await Create("Open B", TicketStatus.Open, TicketPriority.High);
        await Create("Closed C", TicketStatus.Closed, TicketPriority.Low);

        var page = await Client.GetFromJsonAsync<PagedResult<TicketListItemDto>>(
            "/api/v1/tickets?status=Open&pageSize=8", Json);

        page!.TotalCount.Should().Be(2);
        page.Items.Should().OnlyContain(t => t.Status == TicketStatus.Open);
    }

    [Fact]
    public async Task Filter_search_matches_title()
    {
        await Create("Invoice export bug", TicketStatus.Open, TicketPriority.High);
        await Create("Login issue", TicketStatus.Open, TicketPriority.Low);

        var page = await Client.GetFromJsonAsync<PagedResult<TicketListItemDto>>(
            "/api/v1/tickets?search=invoice", Json);

        page!.TotalCount.Should().Be(1);
        page.Items[0].Title.Should().Contain("Invoice");
    }

    [Fact]
    public async Task Filter_sorts_by_priority_descending()
    {
        await Create("Low one", TicketStatus.Open, TicketPriority.Low);
        await Create("Urgent one", TicketStatus.Open, TicketPriority.Urgent);
        await Create("Medium one", TicketStatus.Open, TicketPriority.Medium);

        var page = await Client.GetFromJsonAsync<PagedResult<TicketListItemDto>>(
            "/api/v1/tickets?sortBy=priority&sortDir=desc", Json);

        page!.Items[0].Priority.Should().Be(TicketPriority.Urgent);
    }

    [Fact]
    public async Task Update_changes_fields_and_rotates_concurrency_token()
    {
        var created = await Create("Before", TicketStatus.Open, TicketPriority.Low);

        var put = await Client.PutAsJsonAsync($"/api/v1/tickets/{created.Id}", new
        {
            title = "After",
            description = "new",
            status = "Resolved",
            priority = "Urgent",
            labels = new[] { "x" },
            concurrencyToken = created.ConcurrencyToken,
        });

        put.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await put.Content.ReadFromJsonAsync<TicketDto>(Json);
        updated!.Title.Should().Be("After");
        updated.Status.Should().Be(TicketStatus.Resolved);
        updated.ConcurrencyToken.Should().NotBe(created.ConcurrencyToken);
    }

    [Fact]
    public async Task Update_with_stale_token_returns_409()
    {
        var created = await Create("Concurrent", TicketStatus.Open, TicketPriority.Low);

        await Client.PutAsJsonAsync($"/api/v1/tickets/{created.Id}", Update(created.ConcurrencyToken, "v2"));

        var stale = await Client.PutAsJsonAsync($"/api/v1/tickets/{created.Id}", Update(created.ConcurrencyToken, "v3"));

        stale.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Update_missing_returns_404()
    {
        var put = await Client.PutAsJsonAsync("/api/v1/tickets/999999", Update(Convert.ToBase64String([1]), "x"));
        put.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_removes_ticket_then_404()
    {
        var created = await Create("Delete me", TicketStatus.Open, TicketPriority.Low);

        (await Client.DeleteAsync($"/api/v1/tickets/{created.Id}")).StatusCode
            .Should().Be(HttpStatusCode.NoContent);
        (await Client.GetAsync($"/api/v1/tickets/{created.Id}")).StatusCode
            .Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Delete_missing_returns_404()
    {
        (await Client.DeleteAsync("/api/v1/tickets/999999")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private static object Update(string token, string title) => new
    {
        title,
        description = "d",
        status = "Open",
        priority = "Low",
        concurrencyToken = token,
    };

    private async Task<TicketDto> Create(string title, TicketStatus status, TicketPriority priority)
    {
        var post = await Client.PostAsJsonAsync("/api/v1/tickets", new
        {
            title,
            description = "seed",
            status = status.ToString(),
            priority = priority.ToString(),
        });
        post.EnsureSuccessStatusCode();
        return (await post.Content.ReadFromJsonAsync<TicketDto>(Json))!;
    }
}
