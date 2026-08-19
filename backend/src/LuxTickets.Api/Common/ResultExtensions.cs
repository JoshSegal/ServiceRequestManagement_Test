using LuxTickets.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace LuxTickets.Api.Common;

public static class ResultExtensions
{
    public static ActionResult<T> ToActionResult<T>(this Result<T> result) => result.Status switch
    {
        ResultStatus.Ok => new OkObjectResult(result.Value),
        ResultStatus.NotFound => Problem(result.Error, StatusCodes.Status404NotFound, "Not Found"),
        ResultStatus.Conflict => Problem(result.Error, StatusCodes.Status409Conflict, "Conflict"),
        _ => Problem("An unexpected error occurred.", StatusCodes.Status500InternalServerError, "Error"),
    };

    private static ObjectResult Problem(string? detail, int status, string title) =>
        new(new ProblemDetails
        {
            Detail = detail,
            Status = status,
            Title = title,
        })
        {
            StatusCode = status,
            ContentTypes = { "application/problem+json" },
        };
}
