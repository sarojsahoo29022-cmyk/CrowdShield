# CrowdShield Supabase setup

Phase 2 creates the persistent database foundation.

The Phase 1 dashboard API still returns mock data. Phase 3 will make those
routes read these tables.

## 1. Create a project

Create a project at [supabase.com](https://supabase.com). From the project
dashboard, open **Settings → API** and keep the project URL and keys available.

## 2. Create the schema and demo data

1. Open the project's **SQL Editor**.
2. Copy the contents of [`schema.sql`](./schema.sql).
3. Run the complete file once.

The script creates these tables:

- `events`
- `zones`
- `incidents`
- `recommendations`
- `kpis`
- `trend_snapshots`

It also inserts demo data for the Metro Arena Championship Final. The inserts
are safe to run again because they use conflict handling.

## 3. Verify the database in Supabase

Run [`verify.sql`](./verify.sql) in the SQL Editor. It checks that:

- All six required tables exist
- The seeded event and related records exist
- Zone data is linked to the event
- Row Level Security is enabled

Expected row counts:

| Table | Count |
| --- | --- |
| events | 1 |
| zones | 5 |
| incidents | 6 |
| recommendations | 5 |
| kpis | 4 |
| trend_snapshots | 12 |

## 4. Configure local environment variables

Copy [`.env.example`](../.env.example) to `.env.local` if you do not already
have one, then set values from **Settings → API**:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is privileged. It must only be used by server-side
Next.js code, must never be prefixed with `NEXT_PUBLIC_`, and must never be
committed.

[`lib/supabase-server.ts`](../lib/supabase-server.ts) returns no client when
those credentials are missing. That keeps local mock-data development safe.

Restart `pnpm dev` after changing `.env.local`. Next.js reads environment
variables when the server starts.

## 5. Confirm the Next.js server can reach the database

With the dev server running, open:

```text
http://localhost:3000/api/health
```

Possible results:

- `configured: false` — credentials are not set yet. The dashboard still uses mock data.
- `connected: true` — the server can read the CrowdShield tables.
- HTTP 503 — credentials are set, but the schema has not been applied or the project is unreachable.

This health route does not change the dashboard. Event, zone, incident,
recommendation, and dashboard APIs still return mock data until Phase 3.

## Security model

Row Level Security is enabled on every application table and no public table
policies are defined. The browser therefore cannot access the tables directly.

In Phase 3, server-side API routes will use the service-role client to read
data and return only the fields required by the application.

Do not add the service-role key to frontend components, client hooks, source
control, screenshots, or documentation.
