namespace LuxTickets.Application.Common;

public static class Pagination
{
    public const int DefaultPage = 1;
    public const int DefaultPageSize = 8;
    public const int MaxPageSize = 100;

    public static int ClampPage(int? page) => page is null or < 1 ? DefaultPage : page.Value;

    public static int ClampPageSize(int? pageSize) =>
        pageSize is null or < 1 ? DefaultPageSize : Math.Min(pageSize.Value, MaxPageSize);
}
