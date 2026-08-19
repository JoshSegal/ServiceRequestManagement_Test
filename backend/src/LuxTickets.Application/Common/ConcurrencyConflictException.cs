namespace LuxTickets.Application.Common;

public sealed class ConcurrencyConflictException(string message, Exception innerException)
    : Exception(message, innerException);
