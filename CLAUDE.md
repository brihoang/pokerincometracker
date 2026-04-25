# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server at localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
```

## Architecture

### Core Principle: API-First, Always

React components **never** read or write localStorage directly. All data access goes through the client service layer (`/lib/client/`), which calls `/app/api/...` routes when logged in and reads localStorage directly otherwise. `isLoggedIn()` always returns `false` in V1 — all data is localStorage-only. This contract makes a future Postgres migration seamless: only the repository adapters change.

### Client Service Layer (V1 entry point)

Components call functions in `/lib/client/` — never repositories or localStorage directly.

```
/lib/client/sessions.ts     → getSessions, getOpenSession, createSession, updateSession, deleteSession
/lib/client/locations.ts    → getLocations, createLocation, updateLocation, deleteLocation
/lib/client/stakes.ts       → getStakes, createStake, updateStake, deleteStake
/lib/client/settings.ts     → getSettings, updateSettings
/lib/client/dataManager.ts  → exportData() (Blob download), importData() (localStorage full-replace)
```

### Repository Pattern

Each entity has a repository in `/lib/repositories/`. In V1, repositories read/write localStorage. In V2, they'll swap to Prisma/Postgres. API routes call repositories exclusively.

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
  /components
    StartSessionForm.tsx      → session start form
    OpenSessionEditor.tsx     → inline buy-in/start-time editor for open session on home page
    OpenSessionBanner.tsx     → top banner shown on all pages when a session is open
    StatsStrip.tsx            → 4-tile stats grid (Sessions, P/L, Hours, Avg); accepts optional `mode` prop
    CumulativePnlChart.tsx    → Recharts cumulative P&L line chart with $/BB toggle
    ReportFilters.tsx         → time preset buttons + location/stakes selects (controlled, no internal state)
    FilterSheet.tsx           → mobile bottom-drawer wrapping ReportFilters with draft/apply pattern
    DataManager.tsx           → Export button + Import file-picker with confirmation dialog
    LocationsManager.tsx      → props-based CRUD for locations
    StakesManager.tsx         → props-based CRUD for stakes
    AppSettingsManager.tsx    → default location/stakes selector
  /sessions           → session history list with location/stakes filters
  /sessions/[id]      → session detail/edit (SessionView, SessionEditForm, utils)
  /sessions/close     → close-session form
  /report             → cumulative chart + filters + stats (mobile: FilterSheet; desktop: inline ReportFilters)
  /settings           → locations, stakes, app settings, data export/import
/lib
  /repositories/      → data access layer (localStorage adapters in V1)
  /storage/           → localStorage read/write helpers + key constants
  /types/index.ts     → shared TypeScript interfaces (single source of truth)
  /utils/
    calculations.ts   → calcProfitLoss, calcDurationMins, calcCumulativeProfit
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

**Session** — core entity. `location_name` and `stakes_label` are denormalized snapshots stored at write time; they survive location/stakes renames or deletions. `profit_loss` and `duration_mins` are computed on close and stored (not derived at read time). `big_blind` is stored per-session for BB-mode calculations.

**AppSettings** — single object. `currency_symbol` is hard-coded `"$"` and not user-configurable in V1. `default_location_id` and `default_stakes_id` are nullable UUIDs.

Key field types (from `/lib/types/index.ts`):
- `rating`: `"good" | "neutral" | "bad" | null`
- `status`: `"open" | "closed"`
- `game_type`: `"NLH"` (literal — only game type in V1)
- `YAxisMode`: `"currency" | "bb"` — shared between CumulativePnlChart and StatsStrip on /report
- `TimeRangePreset`: `"all" | "ytd" | "last30" | "last90" | "last180" | "last365" | "custom"`
- All nullable fields typed as `X | null`, never `X | undefined`
- No `any` types

### Business Rules

- Only one session may be `status: "open"` at a time. The "Start Session" form is replaced by `OpenSessionEditor` when one exists.
- `profit_loss = cash_out - buy_in` — computed on session close (PUT route), not client-side.
- `duration_mins` is computed on close using `calcDurationMins`.
- Sessions under 15 minutes trigger a client-side warning before close — but close is not blocked.
- Import (`POST /api/import`) is a **full replace** of all data. Always show a destructive-action confirmation dialog before calling it.
- Deleting a location or stakes entry must not delete sessions that reference them — sessions store snapshots.

### Chart

Uses **Recharts** (`CumulativePnlChart`). Data is sorted by `ended_at` before computing cumulative values via `calcCumulativeProfit()`. A `$ | BB` toggle (shown only when filtered sessions include at least one session with `big_blind` set) controls both the chart Y-axis and the StatsStrip P/L tiles. The toggle state lives in `report/page.tsx` and is passed as props to both components.

### Navigation

All internal links use Next.js `<Link>` (never `<a href>`). After session close, `window.location.href = "/"` is used (full navigation) to ensure the home page re-mounts and fetches fresh data. The `pageshow` event listener pattern (`if (e.persisted) load()`) is used on all pages that display session data to handle bfcache restoration.

### Favicon

Place `favicon.ico` at `app/favicon.ico` — Next.js App Router picks it up automatically.
