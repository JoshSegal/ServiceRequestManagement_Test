using FluentValidation;
using LuxTickets.Application.Tickets;

namespace LuxTickets.Application.Validation;

public sealed class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Body).NotEmpty().MaximumLength(2000);
    }
}
