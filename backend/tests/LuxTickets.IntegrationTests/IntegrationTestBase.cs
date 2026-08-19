using Xunit;

namespace LuxTickets.IntegrationTests;

[Collection("sqlserver")]
public abstract class IntegrationTestBase(SqlServerFixture fixture) : IAsyncLifetime
{
    protected SqlServerFixture Fixture { get; } = fixture;
    protected HttpClient Client { get; } = fixture.Factory.CreateClient();

    public async Task InitializeAsync() => await Fixture.ResetAsync();

    public Task DisposeAsync()
    {
        Client.Dispose();
        return Task.CompletedTask;
    }
}
