 Service Request Management

A support ticketing web app built from the Figma design - a .NET 10 Web API on SQL Server with
an Angular frontend. You can browse, search, filter and sort tickets, page through them, create
and edit them, delete behind a confirm step and leave comments on the detail screen.

Running it

You'll need Docker Desktop for SQL Server. To run the apps directly instead of in containers, you'll also want the .NET 10 SDK and Node 22+.

Everything reads the database password from a .env file, so make one first:

```
cp .env.example .env
```

 Option 1 - the whole stack in Docker

```
docker compose up --build
```

The first run takes a minute: it builds the images, waits for SQL Server, applies the EF
migrations and seeds ~120 tickets. Then it's available at http://localhost:8088.

 Option 2 — run the apps locally

Bring up just the database:

```
docker compose up -d db
```

Then the API (it migrates and seeds itself on startup) at http://localhost:5080:

```
cd backend
dotnet run --project src/LuxTickets.Api
```

And the front-end at http://localhost:4200 — it proxies `/api` to the backend:

```
cd frontend
npm install
npm start
```

One note: the dev connection string in `appsettings.Development.json` uses the same SA
password as `.env.example`, so if you change one, change the other.

A few notes

- The API lives under `/api/v1`. The list screen is driven by `GET /tickets/filter` (which takes`search`, `status`, `priority`, `sortBy`, `sortDir`, `page`, `pageSize`); 
the rest is plain CRUD on `/tickets`, `/tickets/{id}`, and `/tickets/{id}/comments`.
- Updates use optimistic concurrency - editing a stale ticket gives back a 409 instead of quietly overwriting someone else's change.
- Tests: `dotnet test` from `backend/` (the integration tests start SQL Server with Testcontainers so Docker needs to be running), and `npm test` from `frontend/`.```