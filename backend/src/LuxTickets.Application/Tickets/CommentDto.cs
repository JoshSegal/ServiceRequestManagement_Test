namespace LuxTickets.Application.Tickets;

public sealed record CommentDto(int Id, string Body, string? Author, DateTimeOffset CreatedAt);
