using LuxTickets.Domain.Entities;

namespace LuxTickets.Application.Tickets;

public static class CommentMappings
{
    public static CommentDto ToDto(this Comment comment) =>
        new(comment.Id, comment.Body, comment.Author, comment.CreatedAt);
}
