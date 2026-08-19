using FluentValidation;
using LuxTickets.Application.Tickets;

namespace LuxTickets.Application.Validation;

public sealed class CreateTicketRequestValidator : AbstractValidator<CreateTicketRequest>
{
    public CreateTicketRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(10_000);
        RuleFor(x => x.Reporter).MaximumLength(120);
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.Status!.Value).IsInEnum().When(x => x.Status.HasValue);

        When(x => x.Labels is not null, () =>
            RuleForEach(x => x.Labels!).NotEmpty().MaximumLength(50));
    }
}
