using FluentValidation;
using LuxTickets.Application.Tickets;

namespace LuxTickets.Application.Validation;

public sealed class UpdateTicketRequestValidator : AbstractValidator<UpdateTicketRequest>
{
    public UpdateTicketRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(10_000);
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.ConcurrencyToken).NotEmpty();

        When(x => x.Labels is not null, () =>
            RuleForEach(x => x.Labels!).NotEmpty().MaximumLength(50));
    }
}
