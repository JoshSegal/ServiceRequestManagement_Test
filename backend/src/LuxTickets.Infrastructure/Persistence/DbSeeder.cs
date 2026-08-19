using LuxTickets.Domain.Entities;
using LuxTickets.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LuxTickets.Infrastructure.Persistence;

public static class DbSeeder
{
    private static readonly string[] Reporters =
    [
        "Dawid Steyn", "Justin McGowan", "Amara Okafor", "Liam Fischer",
        "Sofia Almeida", "Noah Patel", "Emma Rossouw", "Yuki Tanaka",
    ];

    private static readonly string[] LabelPool =
    [
        "billing", "backend", "frontend", "mobile", "crew-portal", "reports", "auth",
        "payments", "ui", "performance", "data", "email", "scheduling", "api",
    ];

    private static readonly string[] Titles =
    [
        "Add SSO login for the crew portal",
        "Flight schedule sync delayed on mobile app",
        "Dark mode contrast issue on dashboard cards",
        "Booking confirmation email contains a typo",
        "API rate-limit errors on the reports endpoint",
        "Add CSV import for passenger manifests",
        "Legacy PDF invoices archived automatically",
        "Passenger check-in kiosk freezes intermittently",
        "Fuel report totals don't match the ledger",
        "Search returns stale results after filtering",
        "Calendar sync drops recurring crew shifts",
        "Notification emails delayed during peak hours",
        "Two-factor prompt loops on Safari",
        "Maintenance log fails to save attachments",
        "Slot booking allows double-booking a bay",
        "Dashboard widgets overlap on 1440p screens",
        "CSV export uses the wrong date format",
        "Weather widget shows the wrong timezone",
        "Audit log missing entries for bulk edits",
        "Ground handling status not updating live",
        "Login session expires far too quickly",
        "Reports endpoint returns 502 under load",
        "Profile avatars fail to upload over 2MB",
        "Push notifications duplicated on Android",
    ];

    public static async Task SeedAsync(LuxTicketsDbContext context, CancellationToken ct = default)
    {
        if (await context.Tickets.AnyAsync(ct))
        {
            return;
        }

        var now = new DateTimeOffset(2026, 8, 15, 9, 0, 0, TimeSpan.Zero);
        var rng = new Random(20260815);
        var tickets = new List<Ticket> { InvoiceWithComments(now) };

        // Pad out to a realistic volume so the list has a stack of pages to work through.
        for (var i = 0; i < 119; i++)
        {
            var created = now.AddDays(-rng.Next(1, 175)).AddMinutes(-rng.Next(0, 1440));
            var title = Titles[rng.Next(Titles.Length)];
            tickets.Add(new Ticket
            {
                Title = title,
                Description =
                    $"{title}.\n\nReported via the operations queue. Steps to reproduce and "
                    + "expected vs. actual behaviour to be confirmed during triage.",
                Status = (TicketStatus)rng.Next(0, 5),
                Priority = (TicketPriority)rng.Next(0, 4),
                Reporter = Reporters[rng.Next(Reporters.Length)],
                CreatedAt = created,
                UpdatedAt = created.AddHours(rng.Next(1, 72)),
                Labels = PickLabels(rng),
            });
        }

        // Insert oldest-first so the newest ticket gets the highest LUX-#### reference.
        foreach (var ticket in tickets.OrderBy(t => t.CreatedAt))
        {
            context.Tickets.Add(ticket);
        }

        await context.SaveChangesAsync(ct);
    }

    private static List<Label> PickLabels(Random rng) =>
        Enumerable.Range(0, rng.Next(1, 4))
            .Select(_ => LabelPool[rng.Next(LabelPool.Length)])
            .Distinct()
            .Select(name => new Label { Name = name })
            .ToList();

    private static Ticket InvoiceWithComments(DateTimeOffset now) => new()
    {
        Title = "Invoice export fails when selecting more than 50 rows",
        Description =
            "When a user selects more than 50 rows in the invoice list and clicks \"Export\", "
            + "the request times out after ~30s and returns a 500. Smaller selections export "
            + "correctly.\n\n**Expected:** the export completes and downloads a CSV.\n"
            + "**Actual:** the request fails and no file is produced.",
        Status = TicketStatus.InProgress,
        Priority = TicketPriority.High,
        Reporter = "Dawid Steyn",
        CreatedAt = new DateTimeOffset(2026, 8, 12, 9, 14, 0, TimeSpan.Zero),
        UpdatedAt = now.AddHours(-2),
        Labels = [new Label { Name = "billing" }, new Label { Name = "backend" }],
        Comments =
        [
            new Comment
            {
                Author = "Amara Okafor",
                Body =
                    "Reproduced on staging - the export query isn't paginated, so large "
                    + "selections blow past the timeout. I'll add cursor-based pagination.",
                CreatedAt = now.AddHours(-1),
            },
            new Comment
            {
                Author = "Justin McGowan",
                Body = "Customer is waiting on this for month-end billing, so bumping to High.",
                CreatedAt = now.AddMinutes(-40),
            },
        ],
    };
}
