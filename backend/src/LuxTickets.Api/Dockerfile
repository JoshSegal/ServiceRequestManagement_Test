FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/ ./backend/
RUN dotnet restore backend/src/LuxTickets.Api/LuxTickets.Api.csproj
RUN dotnet publish backend/src/LuxTickets.Api/LuxTickets.Api.csproj \
    -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

USER $APP_UID

ENTRYPOINT ["dotnet", "LuxTickets.Api.dll"]
