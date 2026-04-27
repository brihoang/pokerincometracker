# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server at localhost:3000
npm run build     # Production build
npm run lint      # ESLint check
npx drizzle-kit push   # Push schema changes to Neon (loads .env.local automatically)
```

## Architecture

### Core Principle: API-First, Always

React components **never** read or write localStorage directly. All data access goes through the client service layer (`/lib/client/`), which calls `/app/api/...` routes when logged in and reads localStorage directly otherwise.

Auth state is determined by `waitForAuth()` (not `isLoggedIn()`) — an async function that resolves once Clerk has confirmed the session. `AuthSync` in the layout populates this via `useAuth`. Never call `isLoggedIn()` directly in service functions; always `await waitForAuth()`.

### Auth (Clerk)

- `ClerkProvider` wraps the app in `app/layout.tsx` with `appearance={{ theme: dark }}`
- Middleware (`middleware.ts`) makes auth available on all routes but never forces sign-in
- All API routes call `await auth()` from `@clerk/nextjs/server` and return 401 if no `userId`
- Sign-in/sign-up pages live at `app/sign-in/[[...sign-in]]` and `app/sign-up/[[...sign-up]]`
- `AuthSync` component (in layout) sets auth state and wipes localStorage on sign-out
- `MigrationBanner` component (in layout) handles the login data migration flow

### Login / Data Migration Flow

On login, `MigrationBanner` checks for local data and prompts accordingly:

| Local data | DB data | Behavior |
|---|---|---|
| None | None | Silent — fresh start |
| None | Exists | Silent — DB data loads automatically |
| Exists | None | Prompt to import local data (safe) |
| Exists | Exists | Prompt to import with destructive warning (replaces account data) |

On dismiss or after import: localStorage is wiped. On logout: localStorage is wiped immediately.

`GET /api/data/status` → `{ hasData: boolean }` — checks all 4 tables with LIMIT 1.

### Database (Neon + Drizzle)

- Schema: `lib/schema.ts` — tables: `sessions`, `locations`, `stakes`, `settings`
- DB connection: `lib/db.ts` — uses `@neondatabase/serverless` + `drizzle-orm/neon-http`
- All tables have a `user_id` column; all queries are scoped by `userId`
- `settings` table uses `user_id` as primary key (one row per user)
- `DATABASE_URL` lives in `.env.local`

**Money as cents:** All money fields (`buy_in`, `cash_out`, `profit_loss`, `big_blind`, `small_blind`) are stored as **integer cents** in the DB. Repository layer multiplies by 100 on write and divides by 100 on read. UI types remain in dollars throughout. The import route also multiplies by 100 when migrating localStorage data.

**Timestamps:** DB columns are `timestamp with time zone`. Repositories convert to/from ISO strings at the boundary to match TypeScript types.

### Client Service Layer

Components call functions in `/lib/client/` — never repositories or localStorage directly.

```
/lib/client/sessions.ts     → getSessions, getOpenSession, createSession, updateSession, deleteSession
/lib/client/locations.ts    → getLocations, createLocation, updateLocation, deleteLocation
/lib/client/stakes.ts       → getStakes, createStake, updateStake, deleteStake
/lib/client/settings.ts     → getSettings, updateSettings
/lib/client/auth.ts         → waitForAuth(), setAuthState(), isLoggedIn()
/lib/client/dataManager.ts  → exportData, importData, deleteAllData, hasLocalData, clearLocalData, getLocalPayload
```

### Repository Pattern

Each entity has a repository in `/lib/repositories/`. Repositories use Drizzle/Neon and accept `userId` as the first parameter on every method.

```
/lib/repositories/sessions.ts   → SessionRepository (getAll, getById, getOpen, create, update, delete)
/lib/repositories/locations.ts  → LocationRepository (getAll, create, update, delete)
/lib/repositories/stakes.ts     → StakesRepository (getAll, create, update, delete)
/lib/repositories/settings.ts   → SettingsRepository (get, update) — upserts default row if none exists
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
    /data             → GET (status check), DELETE (wipe all user data)
    /export           → GET (full JSON dump)
    /import           → POST (full replace — writes to Neon when logged in)
  /components
    AuthSync.tsx            → sets auth state from Clerk, wipes localStorage on sign-out
    MigrationBanner.tsx     → login-time prompt to import local data to DB
    StartSessionForm.tsx    → session start form
    OpenSessionEditor.tsx   → inline buy-in/start-time editor for open session on home page
    OpenSessionBanner.tsx   → top banner shown on all pages when a session is open
    StatsStrip.tsx          → 4-tile stats grid (Sessions, P/L, Hours, Avg); accepts optional `mode` prop
    CumulativePnlChart.tsx  → Recharts cumulative P&L line chart with $/BB toggle
    ReportFilters.tsx       → time preset buttons + location/stakes selects (controlled, no internal state)
    FilterSheet.tsx         → mobile bottom-drawer wrapping ReportFilters with draft/apply pattern
    DataManager.tsx         → Export, Import, and Delete All Data with confirmation dialogs
    LocationsManager.tsx    → props-based CRUD for locations
    StakesManager.tsx       → props-based CRUD for stakes
    AppSettingsManager.tsx  → default location/stakes selector
  /sign-in/[[...sign-in]]   → Clerk sign-in page
  /sign-up/[[...sign-up]]   → Clerk sign-up page
  /sessions           → session history list with location/stakes filters
  /sessions/[id]      → session detail/edit (SessionView, SessionEditForm, utils)
  /sessions/close     → close-session form
  /report             → cumulative chart + filters + stats (mobile: FilterSheet; desktop: inline ReportFilters)
  /settings           → locations, stakes, app settings, data export/import/delete
/lib
  /repositories/      → data access layer (Drizzle/Neon, all methods scoped by userId)
  /storage/           → localStorage read/write helpers + key constants
  /schema.ts          → Drizzle table definitions
  /db.ts              → Neon/Drizzle db instance
  /types/index.ts     → shared TypeScript interfaces (single source of truth)
  /utils/
    calculations.ts   → calcProfitLoss, calcDurationMins, calcCumulativeProfit
    uuid.ts           → generateId() — UUID v4, works in server + browser
```

### localStorage Keys

Used only when not logged in. Wiped on sign-out and after migration.

```
PIT_SESSIONS   → Session[]
PIT_LOCATIONS  → Location[]
PIT_STAKES     → Stakes[]
PIT_SETTINGS   → AppSettings
```

### Data Model

**Session** — core entity. `location_name` and `stakes_label` are denormalized snapshots stored at write time; they survive location/stakes renames or deletions. `profit_loss` and `duration_mins` are computed on close and stored (not derived at read time). `big_blind` is stored per-session for BB-mode calculations.

**AppSettings** — single object. `currency_symbol` is hard-coded `"$"` and not user-configurable. `default_location_id` and `default_stakes_id` are nullable UUIDs.

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
