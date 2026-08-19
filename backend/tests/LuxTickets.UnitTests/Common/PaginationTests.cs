using FluentAssertions;
using LuxTickets.Application.Common;
using Xunit;

namespace LuxTickets.UnitTests.Common;

public class PaginationTests
{
    [Theory]
    [InlineData(null, 1)]
    [InlineData(0, 1)]
    [InlineData(-3, 1)]
    [InlineData(5, 5)]
    public void ClampPage_guards_lower_bound(int? input, int expected) =>
        Pagination.ClampPage(input).Should().Be(expected);

    [Theory]
    [InlineData(null, 8)]
    [InlineData(0, 8)]
    [InlineData(20, 20)]
    [InlineData(1000, 100)]
    public void ClampPageSize_applies_default_and_ceiling(int? input, int expected) =>
        Pagination.ClampPageSize(input).Should().Be(expected);
}
