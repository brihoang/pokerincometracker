# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server at localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
npm run test      # Run tests (once configured)
```

## Architecture

### Core Principle: API-First, Always

React components **never** read or write localStorage directly. All data access goes through `/app/api/...` routes. This is the contract that makes a future Postgres migration seamless — only the repository adapters change, not the routes or components.

### Repository Pattern

Each entity has a repository module in `/lib/repositories/`. In V1, repositories read/write localStorage. In V2, they'll swap to Prisma/Postgres. API routes call repositories exclusively.

```
/lib/repositories/sessions.ts   → SessionRepository
/lib/repositories/locations.ts  → LocationRepository
/lib/repositories/stakes.ts     → StakesRepository
/lib/repositories/settings.ts   → SettingsRepository
```

### Folder Structure

```
/app
  /api
    /sessions         → GET (list), POST (create)
    /sessions/[id]    → GET, PUT, DELETE
    /locations        → GET, POST
    /locations/[id]   → GET, PUT, DELETE
    /stakes           → GET, POST
    /stakes/[id]      → GET, PUT, DELETE
    /settings         → GET, PUT
    /export           → GET (full JSON dump)
    /import           → POST (full replace)
  /dashboard          → Chart + summary stats (home page)
  /sessions           → Session history list
  /settings           → Locations, stakes, app settings management
/lib
  /repositories/      → Data access layer (localStorage adapters in V1)
  /storage/           → localStorage read/write helpers + key constants
  /types/index.ts     → Shared TypeScript interfaces (single source of truth)
  /utils/
    calculations.ts   → P&L, duration, cumulative profit helpers
    uuid.ts           → generateId() — UUID v4, works in server + browser
```

### localStorage Keys

```
PIT_SESSIONS   → Session[]
PIT_LOCATIONS  → Location[]
PIT_STAKES     → Stakes[]
PIT_SETTINGS   → AppSettings
```

### Data Model

**Session** — core entity. `location_name` and `stakes_label` are denormalized snapshots stored at write time; they survive location/stakes renames or deletions. `profit_loss` and `duration_mins` are computed on close and stored (not derived at read time).

**AppSettings** — single object. `currency_symbol` is hard-coded `"$"` and not user-configurable in V1. `default_location_id` and `default_stakes_id` are nullable UUIDs.

Key field types (from `/lib/types/index.ts`):
- `rating`: `"good" | "neutral" | "bad" | null`
- `status`: `"open" | "closed"`
- `game_type`: `"NLH"` (literal — only game type in V1)
- All nullable fields typed as `X | null`, never `X | undefined`
- No `any` types

### Business Rules

- Only one session may be `status: "open"` at a time. The "Start Session" button is **disabled** (not hidden) when one exists.
- `profit_loss = cash_out - buy_in` — computed server-side on session close (in the PUT route), not client-side.
- `duration_mins` is computed server-side on close using the calculation utilities.
- Sessions under 15 minutes trigger a client-side warning before close — but the close is not blocked.
- Import (`POST /api/import`) is a **full replace** of all data. Always show a destructive-action confirmation dialog before calling it.
- Deleting a location or stakes entry must not delete sessions that reference them — sessions store snapshots, not live FK joins.

### Chart

Uses **Recharts** for the cumulative P&L line chart. X-axis is toggleable between session index and calendar date (`ended_at`). A horizontal reference line at y=0 is always visible. Data must be sorted by `ended_at` before computing cumulative values.
