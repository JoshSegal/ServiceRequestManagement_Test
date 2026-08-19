using LuxTickets.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LuxTickets.Infrastructure.Persistence;

public class LuxTicketsDbContext(DbContextOptions<LuxTicketsDbContext> options)
    : DbContext(options)
{
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LuxTicketsDbContext).Assembly);
    }
}
