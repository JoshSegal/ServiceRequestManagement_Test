using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LuxTickets.Infrastructure.Persistence;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<LuxTicketsDbContext>
{
    public LuxTicketsDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? "Server=localhost,1433;Database=LuxTickets;User Id=sa;Password=placeholder;TrustServerCertificate=True;Encrypt=False";

        var options = new DbContextOptionsBuilder<LuxTicketsDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new LuxTicketsDbContext(options);
    }
}
