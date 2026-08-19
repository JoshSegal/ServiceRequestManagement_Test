using FluentAssertions;
using LuxTickets.Application.Common;
using Xunit;

namespace LuxTickets.UnitTests.Common;

public class PagedResultTests
{
    [Fact]
    public void Computes_total_pages_and_navigation_on_first_page()
    {
        var page = new PagedResult<int>([1, 2, 3, 4, 5, 6, 7, 8], page: 1, pageSize: 8, totalCount: 128);

        page.TotalPages.Should().Be(16);
        page.HasPrevious.Should().BeFalse();
        page.HasNext.Should().BeTrue();
    }

    [Fact]
    public void Last_page_has_previous_but_no_next()
    {
        var page = new PagedResult<int>([], page: 16, pageSize: 8, totalCount: 128);

        page.HasPrevious.Should().BeTrue();
        page.HasNext.Should().BeFalse();
    }

    [Fact]
    public void Zero_page_size_is_safe()
    {
        var page = new PagedResult<int>([], page: 1, pageSize: 0, totalCount: 0);
        page.TotalPages.Should().Be(0);
    }
}
