# Product Requirements Document: Poker Income Tracker

**Version**: 1.1  
**Date**: 2026-04-23  
**Status**: Approved

---

## Overview

### Product Vision

A clean, fast, mobile-friendly web application that lets poker players log cash game sessions, track their cumulative profit/loss over time, and build confidence in their results through reliable data — without the friction of manual spreadsheets or the bloat of social platforms.

### Problem Statement

Serious recreational and semi-professional poker players lack a purpose-built, low-friction tool for tracking their cash game results over time. Existing options are either overbuilt (requiring account creation, social features, or subscription fees), too generic (spreadsheets), or missing key features like cumulative profit visualization and location/stakes management. As a result, players either abandon tracking entirely or maintain inconsistent records — making it impossible to accurately evaluate their win rate or bankroll trajectory.

### Target Users & Personas

**Primary Persona — The Serious Recreational Player**
- Plays live No-Limit Hold'em cash games 1–4x per week
- Stakes range from 1/2 to 5/10
- Wants to know if they're actually profitable long-term
- Familiar with basic poker terminology (buy-in, stack, stakes, NLH)
- Plays at a small set of regular venues (local cardroom, casino, home game)
- Does not need social features or comparisons with other players

**Secondary Persona — The Semi-Pro Tracking Player**
- Plays more frequently, tracks results seriously for tax/income purposes
- Needs data export for records
- May eventually want multi-device sync

---

## Goals & Success Metrics

### Business Goals
- Ship a usable V1 as a solo part-time developer
- Establish an API-first architecture that supports a future native mobile app
- Design the data layer so migration from local storage to PostgreSQL requires no breaking API changes

### User Goals
- Log a session quickly (under 60 seconds) without forgetting details
- See a running cumulative P&L chart that tells them if they're profitable
- Trust the data — no lost sessions, no corrupted records
- Export their data when they want it

### KPIs / Measurable Outcomes

| Metric | Target |
|---|---|
| Session log time | Under 60 seconds from open to close |
| Sessions with complete duration | 100% (enforced by product) |
| Chart load time | Under 1 second for up to 500 sessions |
| Data export reliability | 100% of sessions included in JSON export |
| V1 milestone completion | All core features shipped without breaking API contracts |

---

## Use Cases

### Primary Use Cases

1. **UC-01 — Start a session**: Player sits down at a table, opens the app, taps "Start Session," selects their saved location, selects stakes, enters buy-in amount. App records the current timestamp as session start.

2. **UC-02 — End a session**: Player is done playing, opens the app, enters their cash-out amount. App computes P&L. Player optionally adjusts the start time (e.g., forgot to start the timer 30 minutes in), adds a note, adds a star rating, then confirms close.

3. **UC-03 — View profit chart**: Player opens the dashboard and sees a cumulative running profit curve. They toggle the x-axis between calendar time and per-session index.

4. **UC-04 — Review session history**: Player scrolls a list of past sessions sorted by date, sees key fields (date, location, stakes, buy-in, cash-out, P&L, duration, rating).

5. **UC-05 — Edit a past session**: Player realizes they entered the wrong cash-out amount for last week's session and corrects it.

6. **UC-06 — Manage locations**: Player adds a new cardroom to their saved locations list before logging a session there for the first time.

7. **UC-07 — Manage stakes**: Player adds a new stakes level (e.g., 2/5/10) to their saved stakes list.

8. **UC-08 — Export data**: Player exports all session data as a JSON file for backup or future import.

### Secondary Use Cases

9. **UC-09 — Import data**: Player imports a previously exported JSON file to restore their session history (e.g., after switching devices or reinstalling).

10. **UC-10 — Delete a session**: Player removes a session logged in error.

11. **UC-11 — Filter/view by location or stakes**: Player wants to see their win rate at a specific venue or at a specific stake level.

### Edge Cases

- Player forgets to start the session timer; on close, they adjust the start time backward.
- Player starts a session and does not close it (app should preserve the open session state across page refreshes and app restarts).
- Player has zero completed sessions — chart and history should render gracefully with empty states.
- Player exports data with zero sessions — export should still produce valid JSON.
- Import file is malformed or missing required fields — app should reject gracefully with a clear error message.

### Anti-Goals / Out of Scope

- No tournament tracking (including MTTs, sit-and-gos)
- No game types other than No-Limit Hold'em
- No social features (leaderboards, sharing, friend comparisons)
- No real-time live session display (no running timer visible during play)
- No hand history logging or hand replayer
- No automated data import from third-party poker sites
- No subscription, payments, or monetization in V1
- No push notifications or session reminders
- No multi-currency support; currency is hard-coded to USD ($) — no user-configurable symbol
- No cloud sync or multi-device support in V1 (local-only; planned for V2)

---

## Functional Requirements

### Session Management

- **FR-01**: Users must be able to start a new session by recording: location (from saved list), stakes (from saved list), and buy-in amount.
- **FR-02**: The system shall automatically record the current timestamp as the session start time when a session is started.
- **FR-03**: Users must be able to adjust the session start time before closing a session (to correct for late starts).
- **FR-04**: Users must be able to close a session by entering: cash-out amount, optional notes (free text), and optional session rating (Good / Neutral / Bad — 3-option scale, not required).
- **FR-05**: The system shall enforce that every closed session has a valid duration (start time and end time must both be present and end must be after start). If the computed duration is under 15 minutes, the system shall display a warning to the user before confirming the close — but shall not block it.
- **FR-06**: The system shall calculate and store P&L as `cash_out - buy_in` upon session close.
- **FR-07**: The system shall calculate and store session duration in minutes upon session close.
- **FR-08**: Users must be able to edit any field of a past closed session.
- **FR-09**: Users must be able to delete a past session.
- **FR-10**: The system shall persist any in-progress (open) session across page refreshes and browser restarts.
- **FR-11**: Only one session may be open at a time. When a session is open, the "Start Session" button shall be disabled and non-interactive — no warning or modal needed.

### Location Management

- **FR-12**: Users must be able to create a new location by entering free-form text.
- **FR-13**: Users must be able to view, edit, and delete saved locations.
- **FR-14**: Deleting a location that is referenced by existing sessions shall not delete those sessions (location stored as snapshot on session).
- **FR-15**: Location selection during session start must be from the saved list only.

### Stakes Management

- **FR-16**: Users must be able to create a new stakes entry (e.g., "1/2", "2/5", "5/10").
- **FR-17**: Users must be able to view, edit, and delete saved stakes.
- **FR-18**: Deleting a stakes entry referenced by existing sessions shall not delete those sessions (stakes stored as snapshot on session).
- **FR-19**: Stakes selection during session start must be from the saved list only.

### Dashboard & Visualization

- **FR-20**: The dashboard shall display a cumulative running profit chart as the primary visualization.
- **FR-21**: The x-axis of the chart must be toggleable between: (a) calendar time and (b) session index (1, 2, 3…).
- **FR-22**: The chart shall update immediately when a session is added, edited, or deleted.
- **FR-23**: The dashboard shall display summary statistics: total sessions, total profit/loss, total hours played, and average profit per session.

### Session History

- **FR-24**: Users must be able to view a paginated or scrollable list of all closed sessions, sorted by date descending.
- **FR-25**: Each session row shall display: date, location, stakes, buy-in, cash-out, P&L, duration, and star rating.
- **FR-26**: Users must be able to filter the session list by location and/or stakes.

### Data Export / Import

- **FR-27**: Users must be able to export all session data as a JSON file.
- **FR-28**: The exported JSON shall include all session fields, all saved locations, and all saved stakes.
- **FR-29**: Users must be able to import a previously exported JSON file to restore data.
- **FR-30**: The system shall validate imported JSON and surface a clear error message if the file is malformed or missing required fields.
- **FR-31**: Import shall perform a full replace of all existing data (sessions, locations, stakes, and settings). The UI must display a clear warning before the operation proceeds, stating that all existing data will be permanently overwritten.

### App Settings

- **FR-32**: Users must be able to configure a default location and a default stakes entry in App Settings. Either or both may be left unset.
- **FR-33**: The Start Session form must include a "Use Defaults" button that pre-fills the location and stakes fields with the values set in App Settings. If no defaults are configured, the button shall be hidden or disabled.

---

## Non-Functional Requirements

### Performance
- Chart must render in under 1 second for up to 500 sessions on a mid-range mobile device.
- Session list pagination or virtualization required if session count exceeds 200 rows.
- API responses (once backend is live) should return in under 300ms for all read operations.

### Security
- No authentication in V1 (local-only, single-user).
- When cloud sync is introduced in V2, all API routes must be authenticated (JWT or session cookie).
- Exported JSON files should not include any sensitive auth data.
- Future PostgreSQL connection strings and secrets must never be committed to the repo.

### Accessibility
- All interactive elements must have accessible labels (ARIA attributes where applicable).
- Color alone must not convey P&L status — use text labels or icons in addition to red/green coloring.
- Minimum tap target size of 44x44px on mobile.

### Scalability
- API routes must be designed as stateless REST endpoints from day one — no logic that depends on local storage at the API layer.
- Data layer must be abstracted behind a repository/service pattern so swapping localStorage for PostgreSQL requires only changing the data adapter, not rewriting API routes.

---

## User Stories

### Epic: Session Logging

| ID | Story |
|---|---|
| US-01 | As a player, I want to start a session with one tap so that I don't lose track of when I sat down. |
| US-02 | As a player, I want to select my location from a saved list so that I don't retype it every time. |
| US-03 | As a player, I want to select my stakes from a saved list so that logging is fast and consistent. |
| US-04 | As a player, I want to adjust my session start time before closing so that my duration is accurate even if I forgot to start the timer. |
| US-05 | As a player, I want to enter my cash-out amount to close a session so that my P&L is recorded. |
| US-06 | As a player, I want to add a free-text note to a session so that I can capture context about how I played. |
| US-07 | As a player, I want to rate my session as Good, Neutral, or Bad so that I can reflect on quality of play separately from results. |
| US-08 | As a player, I want my open session to persist if I close the browser so that I don't lose it accidentally. |

### Epic: History & Review

| ID | Story |
|---|---|
| US-09 | As a player, I want to see all my past sessions in a list so that I can review my history. |
| US-10 | As a player, I want to edit a past session so that I can correct mistakes. |
| US-11 | As a player, I want to delete a session so that I can remove one logged in error. |
| US-12 | As a player, I want to filter sessions by location so that I can see my results at a specific venue. |
| US-13 | As a player, I want to filter sessions by stakes so that I can compare my performance at different levels. |

### Epic: Dashboard & Charts

| ID | Story |
|---|---|
| US-14 | As a player, I want to see a cumulative profit chart so that I can visualize my bankroll trajectory over time. |
| US-15 | As a player, I want to toggle the chart x-axis between calendar time and session count so that I can view trends in different ways. |
| US-16 | As a player, I want to see summary statistics (total P&L, total sessions, total hours, avg per session) so that I can quickly assess my overall performance. |

### Epic: Location & Stakes Management

| ID | Story |
|---|---|
| US-17 | As a player, I want to add a new location so that I can log sessions at new venues. |
| US-18 | As a player, I want to edit or delete a saved location so that I can keep my list clean. |
| US-19 | As a player, I want to add a new stakes level so that I can log sessions at new buy-in sizes. |
| US-20 | As a player, I want to edit or delete a saved stakes level so that I can keep my list clean. |

### Epic: App Settings

| ID | Story |
|---|---|
| US-23 | As a player, I want to set a default location and stakes in Settings so that I can pre-fill the Start Session form with one tap. |

### Epic: Data Portability

| ID | Story |
|---|---|
| US-21 | As a player, I want to export all my data as a JSON file so that I have a backup I control. |
| US-22 | As a player, I want to import a previously exported JSON file so that I can restore my data after reinstalling or switching devices. |

---

## Data Model

### Entity: Session

```
Session {
  id:            UUID (PK)
  started_at:    DateTime (required)
  ended_at:      DateTime (required on close)
  duration_mins: Integer (computed on close, stored)
  location_id:   UUID (FK → Location)
  location_name: String (snapshot — denormalized at time of logging)
  stakes_id:     UUID (FK → Stakes)
  stakes_label:  String (snapshot — denormalized at time of logging)
  game_type:     String (default: "NLH", enum-constrained)
  buy_in:        Decimal (required)
  cash_out:      Decimal (nullable until closed)
  profit_loss:   Decimal (computed on close: cash_out - buy_in)
  notes:         Text (nullable)
  rating:        Enum ["good", "neutral", "bad"] (nullable)
  status:        Enum ["open", "closed"]
  created_at:    DateTime
  updated_at:    DateTime
}
```

> **Design note**: `location_name` and `stakes_label` are denormalized snapshots. This ensures session history is not corrupted if a location or stakes entry is renamed or deleted later. The FK is a soft reference for analytics only.

### Entity: Location

```
Location {
  id:         UUID (PK)
  name:       String (required, unique per user)
  created_at: DateTime
  updated_at: DateTime
}
```

### Entity: Stakes

```
Stakes {
  id:          UUID (PK)
  label:       String (required, e.g. "1/2", "2/5", "5/10")
  small_blind: Decimal (optional, for future sorting/filtering)
  big_blind:   Decimal (optional)
  created_at:  DateTime
  updated_at:  DateTime
}
```

### Entity: AppSettings (V1 local config)

```
AppSettings {
  currency_symbol:     String (hard-coded "USD" / "$" — not user-configurable in V1)
  default_location_id: UUID (nullable — user-configurable)
  default_stakes_id:   UUID (nullable — user-configurable)
}
```

---

## Technical Architecture

### Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js (App Router) | Chosen by user; supports SSR, API routes, and easy future extraction of API layer |
| Styling | Tailwind CSS | Rapid mobile-first UI with utility classes; pairs naturally with Next.js |
| Charting | Recharts or Tremor | Both are React-native, well-maintained, and handle time-series data; Recharts offers more control, Tremor is faster to ship — recommend Recharts for long-term flexibility |
| V1 Storage | localStorage + a thin repository layer | Zero backend setup; enables solo dev to ship fast |
| V2 Storage | PostgreSQL via Prisma ORM | Prisma's type-safe client and migration system reduces risk on the localStorage → Postgres swap |
| API Routes | Next.js API Routes (`/app/api/...`) | All data access — even in V1 — must go through API routes, not direct localStorage calls from components |
| Future mobile | React Native or any HTTP client | Because all logic lives in Next.js API routes, a native app needs only an auth token to consume the same endpoints |

### Architecture Principles

1. **API-first, always.** Even in V1 with localStorage, React components must call `/api/...` routes — never read/write localStorage directly. This is the contract that makes the Postgres migration seamless.

2. **Repository pattern for data access.** Each entity (Session, Location, Stakes) has a repository class/module. In V1, the repository reads/writes localStorage. In V2, it calls Prisma/PostgreSQL. The API route handlers never know which adapter is active.

3. **Stateless API routes.** No server-side session state. All data context comes from request parameters or a future auth token.

4. **UUID-based IDs from day one.** localStorage and Postgres both work with UUIDs. Auto-increment integers cause collision issues on import/merge.

5. **Snapshot denormalization.** Store `location_name` and `stakes_label` directly on the session at write time. Prevents cascade corruption when reference data changes.

### V1 Local Storage Schema

All data stored as JSON under these keys:

```
pit_sessions    → Session[]
pit_locations   → Location[]
pit_stakes      → Stakes[]
pit_settings    → AppSettings
```

### Folder Structure (recommended)

```
/app
  /api
    /sessions       → GET, POST
    /sessions/[id]  → GET, PUT, DELETE
    /locations      → GET, POST
    /locations/[id] → GET, PUT, DELETE
    /stakes         → GET, POST
    /stakes/[id]    → GET, PUT, DELETE
    /export         → GET (returns JSON)
    /import         → POST (accepts JSON)
  /dashboard        → Chart + summary stats page
  /sessions         → Session history list
  /settings         → Manage locations, stakes, app settings
/lib
  /repositories
    sessions.ts     → SessionRepository (V1: localStorage adapter)
    locations.ts    → LocationRepository
    stakes.ts       → StakesRepository
  /types
    index.ts        → Shared TypeScript interfaces
  /utils
    calculations.ts → P&L, duration, cumulative profit helpers
```

---

## UX / Design Considerations

- **Mobile-first layout.** The primary use case is a player on their phone at the poker table. All primary actions must be thumb-reachable on a 375px viewport.
- **Active session persistence.** If a session is open, display a persistent banner or indicator on every page so the player is never confused about whether a session is in progress.
- **Start session flow.** Should be accessible within 1 tap from the home/dashboard screen.
- **Close session flow.** Single screen: cash-out amount (required), start time adjustment (optional, pre-filled), notes (optional), rating (optional). One "Close Session" CTA.
- **Empty states.** Dashboard and history must render gracefully with zero sessions — show a prompt to log their first session.
- **P&L color coding.** Green for positive, red for negative — but always paired with a + or - symbol and a numeric value for accessibility.
- **Chart responsiveness.** Chart must be scrollable or properly scaled on small screens.
- **Settings.** Locations and stakes management lives in a Settings section — not surfaced in the primary nav.

---

## Open Questions

All open questions resolved. No outstanding items.

| # | Question | Resolution | Impact |
|---|---|---|---|
| OQ-01 | On import: should importing a JSON file **replace** all existing data, or **merge**? | **Full replace** with a clear destructive-action warning shown before confirm. | FR-31 |
| OQ-02 | Should the session rating be 1–5 stars, or a simpler Good/Neutral/Bad scale? | **Good / Neutral / Bad** (3-option enum). Not required on session close. | FR-04, US-07, data model |
| OQ-03 | Should the dashboard chart be filterable by location or stakes? | **Cut from V1.** Chart shows all sessions only. | — |
| OQ-04 | Should there be a default location and/or default stakes pre-fill? | **Yes.** Configurable in Settings. Start Session form shows "Use Defaults" button that pre-fills both fields. | FR-32, FR-33, US-23 |
| OQ-05 | What currency symbol should be used? | **Hard-coded USD ($).** No user-configurable symbol in V1. | AppSettings |
| OQ-06 | Behavior when starting a session while one is already open? | **Disable the "Start Session" button entirely** when a session is open. No warning or modal. | FR-11 |
| OQ-07 | Minimum session duration guard? | **Warn if under 15 minutes, but allow close.** Do not block. | FR-05 |

---

## Assumptions

- All monetary values are in USD. The currency symbol "$" is hard-coded; no user-configurable currency in V1.
- "No-Limit Hold'em" is the only game type and is stored as a constant — no game type selection UI needed in V1.
- The user is the only user of the app in V1 (no authentication, no user accounts).
- Sessions are always live cash games (no rake calculations, no tip tracking).
- The session rating is a 3-value enum: Good, Neutral, Bad. It is optional on session close.
- Buy-in represents the total amount brought to the table in a session (re-buys are the user's responsibility to account for in the buy-in field).
- "Profit/loss" is always computed as `cash_out - buy_in`. There is no "net" calculation accounting for travel, food, etc.
- Import is a destructive full-replace operation. The user is warned explicitly before it executes.
- Only one session can be open at any time; the "Start Session" button is disabled (not hidden) when a session is open.
- Sessions under 15 minutes trigger a warning but are not blocked — the user's intent is respected.

---

## Milestones Overview

### Milestone 1 — Foundation (Estimated: 1–2 weeks part-time)
**Goal**: Project skeleton, data layer, and API routes stubbed. Nothing visible yet, but all contracts are established.

**Deliverables**:
- Next.js project initialized with Tailwind CSS
- TypeScript interfaces for all entities
- Repository pattern implemented with localStorage adapters
- All API route stubs (`/api/sessions`, `/api/locations`, `/api/stakes`) — returning mock data
- UUID generation utility

---

### Milestone 2 — Session Logging Core (Estimated: 2–3 weeks part-time)
**Goal**: A player can start and close a session. This is the single most important user flow.

**Deliverables**:
- Start Session form (location select, stakes select, buy-in input)
- Auto-timestamp on start; session written to localStorage via API
- Open session persistence across refreshes (banner/indicator)
- Close Session form (cash-out, start time adjustment, notes, Good/Neutral/Bad rating)
- P&L and duration calculated and stored on close
- Validation: cash-out required, end must be after start
- Warning displayed when computed duration is under 15 minutes (non-blocking)
- "Start Session" button disabled when a session is already open

---

### Milestone 3 — Reference Data Management (Estimated: 1 week part-time)
**Goal**: A player can manage their saved locations and stakes.

**Deliverables**:
- Locations CRUD (add, edit, delete) via Settings page
- Stakes CRUD (add, edit, delete) via Settings page
- Deletion safety: warn if location/stakes is in use; store snapshots on session
- App Settings: configure default location and default stakes
- "Use Defaults" button on Start Session form pre-fills location and stakes from Settings

---

### Milestone 4 — Session History (Estimated: 1–2 weeks part-time)
**Goal**: A player can review, edit, and delete past sessions.

**Deliverables**:
- Session list page (sorted by date desc, all fields displayed)
- Edit session (all fields editable)
- Delete session (with confirmation)
- Filter by location and/or stakes

---

### Milestone 5 — Dashboard & Charts (Estimated: 1–2 weeks part-time)
**Goal**: A player can see their results visualized.

**Deliverables**:
- Cumulative P&L chart with Recharts
- X-axis toggle: calendar time vs. session index
- Summary stats strip: total P&L, sessions, hours, avg per session
- Empty state for zero sessions

---

### Milestone 6 — Data Portability (Estimated: 1 week part-time)
**Goal**: A player can export and import their data.

**Deliverables**:
- Export: `/api/export` returns full JSON including sessions, locations, stakes
- Import: `/api/import` accepts JSON, validates schema, writes to localStorage
- Import performs a full data replace; user shown a destructive-action warning before confirm
- Import error handling with user-facing messages

---

### Milestone 7 — Polish & V1 Release (Estimated: 1 week part-time)
**Goal**: The app feels complete and production-ready.

**Deliverables**:
- Mobile-first layout audit (tap targets, spacing, viewport)
- Accessibility pass (ARIA labels, color + text P&L indicators)
- Loading states and error states for all API calls
- App icon, page title, favicon
- README with local setup instructions
- Manual QA pass on all primary use cases

---

### Milestone 8 — V2: Cloud Sync (Future — not in current scope)
**Goal**: Optional sign-in with cloud sync. Local-only mode remains fully supported.

**Deliverables** (TBD):
- PostgreSQL setup (Prisma schema mirrors existing data model)
- Swap localStorage repository adapters for Prisma adapters
- Auth (NextAuth.js or Clerk)
- Sync logic (local-first conflict resolution TBD)
- Multi-device session continuity

---

*PRD approved 2026-04-23. All open questions resolved. Detailed ticket breakdown in TICKETS.md.*
