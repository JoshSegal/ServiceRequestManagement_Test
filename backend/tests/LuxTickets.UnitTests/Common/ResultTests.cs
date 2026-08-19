using FluentAssertions;
using LuxTickets.Application.Common;
using Xunit;

namespace LuxTickets.UnitTests.Common;

public class ResultTests
{
    [Fact]
    public void Ok_is_success_and_carries_value()
    {
        var result = Result<string>.Ok("hi");

        result.IsSuccess.Should().BeTrue();
        result.Status.Should().Be(ResultStatus.Ok);
        result.Value.Should().Be("hi");
    }

    [Fact]
    public void NotFound_is_failure_with_error()
    {
        var result = Result<string>.NotFound("nope");

        result.IsSuccess.Should().BeFalse();
        result.Status.Should().Be(ResultStatus.NotFound);
        result.Error.Should().Be("nope");
    }

    [Fact]
    public void Conflict_sets_status()
    {
        Result<string>.Conflict("busy").Status.Should().Be(ResultStatus.Conflict);
    }
}
