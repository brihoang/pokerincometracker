# Poker Income Tracker — Implementation Tickets

**PRD Version**: 1.1  
**Date**: 2026-04-23  
**Status**: Ready for development

Tickets are organized by milestone. Complete M1 fully before starting M2; within a milestone, respect the stated dependencies.

---

## Milestone 1 — Foundation

**Goal**: Project skeleton, TypeScript contracts, repository pattern, and stubbed API routes. Nothing is user-visible yet, but every contract that the rest of the app depends on is established here.

---

### M1-01 — Initialize Next.js project with Tailwind CSS and TypeScript

Set up the base project so every subsequent ticket has a clean, configured environment to build on. This includes installing dependencies, configuring Tailwind, and verifying a blank app runs locally.

**Acceptance Criteria**:

- [x] `npx create-next-app` scaffolded with App Router, TypeScript, and Tailwind CSS
- [x] `npm run dev` starts without errors
- [x] A placeholder home page renders at `localhost:3000`
- [x] Tailwind utility classes apply correctly to a test element (e.g., a colored div)
- [x] ESLint configured and passes with no errors on the initial scaffold

---

### M1-02 — Define shared TypeScript interfaces for all entities

Create a single source of truth for the shape of every data entity used across the app. Typed interfaces prevent drift between the repository layer, API routes, and UI components.

**Acceptance Criteria**:

- [x] `/lib/types/index.ts` exists and exports the following interfaces: `Session`, `Location`, `Stakes`, `AppSettings`
- [x] `Session` includes: `id`, `started_at`, `ended_at`, `duration_mins`, `location_id`, `location_name`, `stakes_id`, `stakes_label`, `game_type`, `buy_in`, `cash_out`, `profit_loss`, `notes`, `rating`, `status`, `created_at`, `updated_at`
- [x] `rating` typed as `"good" | "neutral" | "bad" | null`
- [x] `status` typed as `"open" | "closed"`
- [x] `game_type` typed as `"NLH"` (literal type)
- [x] `Location` includes: `id`, `name`, `created_at`, `updated_at`
- [x] `Stakes` includes: `id`, `label`, `small_blind`, `big_blind`, `created_at`, `updated_at`
- [x] `AppSettings` includes: `currency_symbol` (typed as `"$"`), `default_location_id`, `default_stakes_id`
- [x] All nullable fields are typed as `X | null`, not `X | undefined`
- [x] No `any` types

---

### M1-03 — Implement UUID generation utility

All entity IDs must be UUIDs from day one so the data model is compatible with both localStorage and a future PostgreSQL migration without ID collisions.

**Acceptance Criteria**:

- [x] `/lib/utils/uuid.ts` exports a `generateId()` function that returns a valid UUID v4 string
- [x] Function works in both server (Node.js) and client (browser) contexts
- [x] A unit test or manual smoke test confirms the output format matches UUID v4 pattern

---

### M1-04 — Implement localStorage adapter utilities

Create the low-level read/write helpers that all repository modules will use. Abstracting this prevents localStorage key typos and centralizes the JSON serialization boundary.

**Acceptance Criteria**:

- [x] `/lib/storage/localStorage.ts` exports typed `getItem<T>(key: string): T | null` and `setItem<T>(key: string, value: T): void` helpers
- [x] Storage keys are defined as constants: `PIT_SESSIONS`, `PIT_LOCATIONS`, `PIT_STAKES`, `PIT_SETTINGS`
- [x] Reads return `null` (not throw) if the key does not exist
- [x] Writes serialize to JSON; reads parse from JSON
- [x] Functions are safe to import in API route context (should not throw if `window` is unavailable — guard with `typeof window !== "undefined"`)

---

### M1-05 — Implement SessionRepository with localStorage adapter

The repository is the only layer that reads or writes session data. All API routes call the repository — never localStorage directly.

**Acceptance Criteria**:

- [x] `/lib/repositories/sessions.ts` exports a `SessionRepository` object or class with the following methods: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `getOpen()`
- [x] `getAll()` returns `Session[]` sorted by `started_at` descending
- [x] `getOpen()` returns the single open session or `null`
- [x] `create()` assigns a UUID, sets `created_at` and `updated_at`, and persists via the localStorage adapter
- [x] `update()` merges partial fields and updates `updated_at`
- [x] `delete()` removes the entry by ID
- [x] All methods operate on the `PIT_SESSIONS` key

---

### M1-06 — Implement LocationRepository with localStorage adapter

**Acceptance Criteria**:

- [x] `/lib/repositories/locations.ts` exports a `LocationRepository` with: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`
- [x] `getAll()` returns `Location[]` sorted alphabetically by `name`
- [x] `create()` validates that `name` is non-empty before persisting
- [x] All methods operate on the `PIT_LOCATIONS` key

---

### M1-07 — Implement StakesRepository with localStorage adapter

**Acceptance Criteria**:

- [x] `/lib/repositories/stakes.ts` exports a `StakesRepository` with: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`
- [x] `getAll()` returns `Stakes[]` sorted by `small_blind` ascending (nulls last), then alphabetically by `label`
- [x] `create()` validates that `label` is non-empty before persisting
- [x] All methods operate on the `PIT_STAKES` key

---

### M1-08 — Implement AppSettingsRepository with localStorage adapter

**Acceptance Criteria**:

- [x] `/lib/repositories/settings.ts` exports a `SettingsRepository` with: `get()`, `update(data)`
- [x] `get()` returns the stored `AppSettings` or a default object (`{ currency_symbol: "$", default_location_id: null, default_stakes_id: null }`) if nothing is stored
- [x] `update()` merges partial fields and persists
- [x] Operates on the `PIT_SETTINGS` key

---

### M1-09 — Stub all API routes

Create all route files so the folder structure is established and imports resolve correctly. Routes return mock/empty responses at this stage — they are wired to real repositories in later milestones.

**Acceptance Criteria**:

- [x] The following route files exist and return `200 OK` with an empty array or object:
  - `GET /api/sessions`
  - `POST /api/sessions`
  - `GET /api/sessions/[id]`
  - `PUT /api/sessions/[id]`
  - `DELETE /api/sessions/[id]`
  - `GET /api/locations`
  - `POST /api/locations`
  - `GET /api/locations/[id]`
  - `PUT /api/locations/[id]`
  - `DELETE /api/locations/[id]`
  - `GET /api/stakes`
  - `POST /api/stakes`
  - `GET /api/stakes/[id]`
  - `PUT /api/stakes/[id]`
  - `DELETE /api/stakes/[id]`
  - `GET /api/settings`
  - `PUT /api/settings`
  - `GET /api/export`
  - `POST /api/import`
- [x] All routes use Next.js App Router `route.ts` convention
- [x] No route imports directly from localStorage — all are stubbed with inline placeholder returns for now

---

### M1-10 — Implement P&L and duration calculation utilities

Centralize all business logic calculations so they can be reused by API routes and tested independently.

**Acceptance Criteria**:

- [x] `/lib/utils/calculations.ts` exports:
  - `calcProfitLoss(buyIn: number, cashOut: number): number` — returns `cashOut - buyIn`
  - `calcDurationMins(startedAt: Date, endedAt: Date): number` — returns whole minutes, rounded down
  - `calcCumulativeProfit(sessions: Session[]): { session: Session; cumulative: number }[]` — returns sessions in chronological order with a running cumulative P&L value
- [x] `calcDurationMins` returns `0` (not negative) if `endedAt` is before `startedAt`
- [x] `calcCumulativeProfit` handles an empty array by returning `[]`

---

## Milestone 2 — Session Logging Core

**Goal**: A player can start and close a session end-to-end. This is the single highest-priority user flow.

**Depends on**: M1 complete.

---

### M2-01 — Wire GET /api/sessions and POST /api/sessions to SessionRepository

Connect the stub routes to the real repository so session data persists and can be retrieved.

**Acceptance Criteria**:

- [x] `GET /api/sessions` returns all sessions from `SessionRepository.getAll()` as JSON
- [x] `POST /api/sessions` accepts `{ location_id, location_name, stakes_id, stakes_label, buy_in, started_at }`, validates required fields, creates a session with `status: "open"` and `game_type: "NLH"`, and returns the created session with `201`
- [x] Missing required fields return `400` with a descriptive error message
- [x] `GET /api/sessions?status=open` filters to return only the open session (or empty array)

---

### M2-02 — Wire GET, PUT, DELETE /api/sessions/[id] to SessionRepository

**Acceptance Criteria**:

- [x] `GET /api/sessions/[id]` returns the session or `404` if not found
- [x] `PUT /api/sessions/[id]` accepts a partial session payload, merges it, and returns the updated session
- [x] `DELETE /api/sessions/[id]` removes the session and returns `204`
- [x] All routes return `404` with a clear message if the ID does not exist

---

### M2-03 — Wire GET /api/locations and GET /api/stakes to their repositories

The Start Session form depends on these lists being available. Wire them before building the UI.

**Acceptance Criteria**:

- [x] `GET /api/locations` returns `Location[]` from `LocationRepository.getAll()`
- [x] `GET /api/stakes` returns `Stakes[]` from `StakesRepository.getAll()`
- [x] Both return `200` with an empty array when no data exists (no 404 or 500)

---

### M2-04 — Build the Start Session form

The primary action in the app. The player selects a location, selects stakes, enters a buy-in, and taps "Start Session." The session is created with the current timestamp.

**Acceptance Criteria**:

- [x] Form renders on the home/dashboard page, accessible within one tap
- [x] Location field is a dropdown populated from `GET /api/locations`
- [x] Stakes field is a dropdown populated from `GET /api/stakes`
- [x] Buy-in field is a numeric input (decimal, USD, minimum value `0.01`)
- [x] "Start Session" button submits to `POST /api/sessions` with the current client timestamp as `started_at`
- [x] On success, UI transitions to the "session in progress" state without a full page reload
- [x] If either locations or stakes list is empty, a visible prompt guides the user to add them in Settings before they can start
- [x] Form validates that all three fields are filled before submission
- [x] "Start Session" button is **disabled** (not hidden) when a session with `status: "open"` already exists

---

### M2-05 — Build the "Use Defaults" shortcut on the Start Session form

Players who always play the same game should be able to fill the form in one tap using their configured defaults.

**Acceptance Criteria**:

- [x] Start Session form fetches `GET /api/settings` on load
- [x] If `default_location_id` and/or `default_stakes_id` are set, a "Use Defaults" button appears above the form fields
- [x] Tapping "Use Defaults" pre-fills the location and stakes dropdowns with the configured defaults
- [x] If neither default is set, the button is not rendered
- [x] Pre-fill does not submit the form — the user still taps "Start Session" to confirm

---

### M2-06 — Persist open session state across page refreshes

If the player navigates away or refreshes the browser while a session is open, the app must recover the in-progress session on next load.

**Acceptance Criteria**:

- [x] On app load (and on every route navigation), the app calls `GET /api/sessions?status=open`
- [x] If an open session is found, a persistent banner/indicator is displayed on every page showing the session is in progress (location, stakes, elapsed time at time of page load is acceptable — no live timer required)
- [x] The banner includes a link/button to navigate to the Close Session flow
- [x] Refreshing the page while a session is open preserves the banner state
- [x] If no open session exists, the banner is not rendered

---

### M2-07 — Build the Close Session form

The player enters their cash-out amount, optionally adjusts the start time, adds notes, and optionally sets a rating to close the session.

**Acceptance Criteria**:

- [x] Close Session screen is reachable from the open session banner
- [x] Cash-out amount field is required (numeric, decimal, minimum `0`)
- [x] Start time field is pre-filled with `started_at` from the open session and is editable (date + time picker or text input in ISO format)
- [x] Notes field is optional free-text (textarea, no character limit enforcement in V1)
- [x] Rating field is optional — renders as three selectable options: Good, Neutral, Bad. No option is selected by default
- [x] "Close Session" CTA submits a `PUT /api/sessions/[id]` with `cash_out`, `ended_at` (current timestamp), adjusted `started_at`, `notes`, `rating`, and `status: "closed"`
- [x] On submit, the API route computes and stores `profit_loss` and `duration_mins` using the calculation utilities
- [x] On success, the open session banner is dismissed and the UI returns to the home/dashboard state
- [x] Form validates that `ended_at` is after `started_at` and surfaces an inline error if not

---

### M2-08 — Implement the short-session warning on close

Protect against accidental session closes where the player may have forgotten to enter the right cash-out or start time.

**Acceptance Criteria**:

- [x] Before submitting the Close Session form, the client computes the session duration from `started_at` to the current time
- [x] If duration is under 15 minutes, a visible inline warning appears (e.g., "This session is only X minutes long — are you sure?")
- [x] The warning does not block submission — the "Close Session" button remains active and functional
- [x] The warning disappears if the user adjusts the start time so that duration exceeds 15 minutes

---

## Milestone 3 — Reference Data Management

**Goal**: Players can manage their saved locations and stakes, and configure default values for the Start Session form.

**Depends on**: M1 complete. M2 in progress is acceptable.

---

### M3-01 — Wire all Location API routes to LocationRepository

**Acceptance Criteria**:

- [x] `POST /api/locations` accepts `{ name }`, validates non-empty, creates and returns the location with `201`
- [x] `PUT /api/locations/[id]` accepts `{ name }`, updates and returns the location, or `404` if not found
- [x] `DELETE /api/locations/[id]` removes the location and returns `204`, or `404` if not found
- [x] Attempting to create a location with a duplicate name returns `409` with a clear error message

---

### M3-02 — Wire all Stakes API routes to StakesRepository

**Acceptance Criteria**:

- [x] `POST /api/stakes` accepts `{ label, small_blind?, big_blind? }`, validates non-empty label, creates and returns the stakes entry with `201`
- [x] `PUT /api/stakes/[id]` accepts `{ label, small_blind?, big_blind? }`, updates and returns, or `404`
- [x] `DELETE /api/stakes/[id]` removes the entry and returns `204`, or `404`
- [x] Attempting to create a stakes entry with a duplicate label returns `409`

---

### M3-03 — Build the Settings page shell and navigation

The Settings page is the container for Locations management, Stakes management, and App Settings. It must exist before the sub-sections are built.

**Acceptance Criteria**:

- [x] A `/settings` route renders a Settings page
- [x] Settings is reachable from the primary navigation (bottom nav or header link)
- [x] Page has clearly labeled sections or tabs for: Locations, Stakes, App Settings
- [x] Page is mobile-friendly with 44px minimum tap targets

---

### M3-04 — Build Locations management UI

Players must be able to add, rename, and delete their saved venues.

**Acceptance Criteria**:

- [x] Locations section lists all saved locations from `GET /api/locations`
- [x] "Add Location" action opens an inline form or modal with a name text input
- [x] Submitting the form calls `POST /api/locations` and refreshes the list on success
- [x] Each location row has an Edit action that allows renaming via inline edit or modal, calling `PUT /api/locations/[id]`
- [x] Each location row has a Delete action that calls `DELETE /api/locations/[id]`
- [x] Before deleting a location that is referenced by one or more sessions (check via `GET /api/sessions`), display a warning: "This location is used by X session(s). Deleting it will not affect those sessions." User must confirm before proceeding
- [x] Empty state renders a prompt when no locations exist
- [x] All actions optimistically update the list or re-fetch on completion

---

### M3-05 — Build Stakes management UI

**Acceptance Criteria**:

- [x] Stakes section lists all saved stakes from `GET /api/stakes`
- [x] "Add Stakes" action opens an inline form or modal with: label (required), small blind (optional), big blind (optional)
- [x] Submitting calls `POST /api/stakes` and refreshes the list on success
- [x] Each stakes row has an Edit action calling `PUT /api/stakes/[id]`
- [x] Each stakes row has a Delete action calling `DELETE /api/stakes/[id]`
- [x] Before deleting a stakes entry referenced by one or more sessions, display a warning similar to M3-04 — confirm before proceeding
- [x] Empty state renders a prompt when no stakes exist

---

### M3-06 — Wire GET and PUT /api/settings to SettingsRepository

**Acceptance Criteria**:

- [x] `GET /api/settings` returns the current `AppSettings` (or defaults if none stored)
- [x] `PUT /api/settings` accepts `{ default_location_id?, default_stakes_id? }`, merges with existing settings, and returns the updated object
- [x] Missing or null values for `default_location_id` / `default_stakes_id` are accepted and stored as `null` (i.e., user can clear defaults)

---

### M3-07 — Build App Settings UI (default location and stakes)

Players can configure a default location and default stakes so the Start Session form pre-fills automatically.

**Acceptance Criteria**:

- [x] App Settings section shows two dropdowns: "Default Location" and "Default Stakes"
- [x] Both dropdowns are populated from `GET /api/locations` and `GET /api/stakes` respectively
- [x] Both dropdowns include a "None" / empty option so defaults can be cleared
- [x] Current defaults are pre-selected on load from `GET /api/settings`
- [x] Changes are saved via `PUT /api/settings` on selection change or an explicit "Save" action
- [x] A success confirmation is shown after saving

---

## Milestone 4 — Session History

**Goal**: Players can review, edit, and delete all past sessions.

**Depends on**: M2 complete.

---

### M4-01 — Build the Session History list page

The session list is the player's primary audit trail. Every closed session must be visible here.

**Acceptance Criteria**:

- [x] `/sessions` route renders a session history page
- [x] Page is reachable from primary navigation
- [x] Sessions are fetched from `GET /api/sessions` and displayed in date-descending order
- [x] Only `status: "closed"` sessions are shown (open sessions are not in this list)
- [x] Each row displays: date (formatted, e.g., "Apr 15, 2026"), location name, stakes label, P&L, duration (in hours and minutes), and rating
- [x] P&L is displayed in green with a "+" prefix for positive values and red with a "-" prefix for negative values; zero is neutral
- [x] Empty state renders when no sessions exist, with a prompt to log the first session
- [x] List is scrollable; pagination or virtualization applied if session count exceeds 200

---

### M4-02 — Build the Edit Session flow

Players may need to correct buy-in, cash-out, start/end time, notes, or rating after the fact.

**Acceptance Criteria**:

- [x] Each session row in the history list has an Edit button/icon
- [x] Tapping Edit opens an edit form (full-page or modal) pre-filled with all session fields
- [x] Editable fields: `started_at`, `ended_at`, `buy_in`, `cash_out`, `notes`, `rating`
- [x] Location and stakes are displayed as read-only (editing them is not supported in V1; snapshot values are preserved as-is)
- [x] Submitting calls `PUT /api/sessions/[id]` with the changed fields
- [x] On successful save, `profit_loss` and `duration_mins` are recomputed server-side using the updated values
- [x] On success, the session row in the list updates to reflect the new values without a full page reload
- [x] Validation: `ended_at` must be after `started_at`; `buy_in` and `cash_out` must be valid non-negative numbers

---

### M4-03 — Build the Delete Session flow

**Acceptance Criteria**:

- [x] Each session row has a Delete button/icon
- [x] Tapping Delete shows a confirmation dialog: "Delete this session? This cannot be undone."
- [x] Confirming calls `DELETE /api/sessions/[id]`
- [x] On success, the session is removed from the list without a full page reload
- [x] Canceling the dialog leaves the session intact

---

### M4-04 — Build session list filters (location and stakes)

Players want to isolate their results at a specific venue or stake level.

**Acceptance Criteria**:

- [x] A filter bar above the session list contains two dropdowns: "Location" and "Stakes"
- [x] Both dropdowns are populated from the distinct values present in the session list (not from the saved locations/stakes lists — historical snapshots may differ)
- [x] Selecting a value filters the visible session list in real time (client-side filter, no API call required)
- [x] Both filters can be active simultaneously (AND logic — location AND stakes)
- [x] A "Clear Filters" action resets both dropdowns to "All"
- [x] Summary stats (total sessions, total P&L, total hours) update to reflect the filtered subset

---

## Milestone 5 — Dashboard & Charts

**Goal**: Players can see their results visualized with a cumulative P&L chart and summary statistics.

**Depends on**: M2 complete. M4 in progress is acceptable.

---

### M5-01 — Build the summary statistics strip

Quick-glance numbers that tell the player how they're doing overall.

**Acceptance Criteria**:

- [x] Dashboard displays four stat tiles: Total Sessions, Total P&L (USD), Total Hours Played, Average P&L per Session
- [x] Values are computed from all closed sessions fetched from `GET /api/sessions`
- [x] Total P&L displays with "+" prefix for positive, "-" for negative, always with dollar sign
- [x] Average P&L per session displays with same sign convention
- [x] Total Hours Played displays as decimal hours (e.g., "47.5 hrs") or hours + minutes (e.g., "47h 30m") — pick one format and apply consistently
- [x] All four tiles render gracefully with zero sessions (show "0" or "$0.00" — no errors or blank tiles)

---

### M5-02 — Build the cumulative P&L chart

The chart is the primary visualization — a running total of profit or loss over time, showing the player's bankroll trajectory.

**Acceptance Criteria**:

- [ ] Dashboard renders a line chart using Recharts showing cumulative P&L on the Y-axis
- [ ] X-axis defaults to session index (1, 2, 3…)
- [ ] A toggle control (button group or radio) switches the X-axis between "Session #" and "Date"
- [ ] When "Date" is selected, the X-axis uses the `ended_at` timestamp of each session
- [ ] Data points are connected by a line; each point represents one closed session
- [ ] Line color is green when the cumulative value at that point is positive, red when negative (or a single neutral color if per-segment coloring adds too much complexity — a reference line at zero is the minimum requirement)
- [ ] A horizontal reference line at y=0 is always visible
- [ ] Chart tooltip shows: session date, location, stakes, session P&L, and cumulative P&L on hover/tap
- [ ] Chart renders in under 1 second for up to 500 data points on a mid-range mobile device
- [ ] Chart is responsive and scrollable on small screens (375px viewport minimum)
- [ ] Empty state: if no sessions exist, chart area renders a "No data yet — log your first session" message instead of an empty chart frame

---

### M5-03 — Wire the dashboard to live session data

Ensure the dashboard always reflects the latest data after a session is added, edited, or deleted.

**Acceptance Criteria**:

- [ ] Dashboard fetches sessions from `GET /api/sessions` on every mount
- [ ] After a session is closed (from M2-07), the dashboard stats and chart update without requiring a manual page refresh
- [ ] After a session is edited or deleted (from M4-02, M4-03), navigating to the dashboard shows updated values
- [ ] Chart handles the case where a session is edited and its date changes (re-sort by `ended_at` before computing cumulative values)

---

## Milestone 6 — Data Portability

**Goal**: Players can export all their data as a JSON backup and restore from a previously exported file.

**Depends on**: M2, M3 complete.

---

### M6-01 — Implement GET /api/export

**Acceptance Criteria**:

- [ ] `GET /api/export` returns a JSON response containing: all sessions (`Session[]`), all locations (`Location[]`), all stakes (`Stakes[]`), and app settings (`AppSettings`)
- [ ] Response includes a `exported_at` ISO timestamp at the top level
- [ ] Response includes a `version` field (set to `"1"`) for future import compatibility checking
- [ ] Content-Type header is `application/json`
- [ ] Export includes sessions of all statuses (including any open session, if present)
- [ ] Returns `200` with valid JSON even when all collections are empty

---

### M6-02 — Implement POST /api/import with full-replace behavior

**Acceptance Criteria**:

- [ ] `POST /api/import` accepts a JSON body matching the export schema
- [ ] The route validates that the payload contains `sessions`, `locations`, and `stakes` arrays
- [ ] Validation checks that each session contains required fields: `id`, `started_at`, `buy_in`, `status`
- [ ] If validation fails, return `400` with a descriptive error listing which fields or records are invalid
- [ ] If validation passes, the route **replaces** all existing data: clears `PIT_SESSIONS`, `PIT_LOCATIONS`, `PIT_STAKES`, and `PIT_SETTINGS`, then writes the imported data
- [ ] Returns `200` with a summary: `{ imported: { sessions: N, locations: N, stakes: N } }`
- [ ] If the payload contains a `version` field, the route checks it matches `"1"` and returns `400` if not

---

### M6-03 — Build the Export UI

**Acceptance Criteria**:

- [ ] A "Export Data" button exists in the Settings page
- [ ] Clicking it calls `GET /api/export` and triggers a browser file download named `poker-tracker-export-YYYY-MM-DD.json`
- [ ] The button remains functional when there are zero sessions (exports valid empty JSON)
- [ ] A brief success message is shown after the file download begins

---

### M6-04 — Build the Import UI with destructive-action warning

Import replaces all data. The player must be clearly warned before this happens.

**Acceptance Criteria**:

- [ ] An "Import Data" button exists in the Settings page
- [ ] Clicking it opens a file picker accepting `.json` files only
- [ ] After the user selects a file, a confirmation dialog appears with the text: "Importing will permanently replace all your existing sessions, locations, and stakes. This cannot be undone. Continue?"
- [ ] The dialog has a clearly labeled "Cancel" action and a clearly labeled destructive "Replace All Data" action
- [ ] Canceling the dialog closes it without sending any request
- [ ] Confirming sends the parsed JSON to `POST /api/import`
- [ ] On success, the app re-fetches all data and the UI reflects the imported state
- [ ] On error (validation failure from API), an error message is displayed inline showing what went wrong
- [ ] The file picker does not pre-select or retain a previously chosen file after an import attempt

---

## Milestone 7 — Polish & V1 Release

**Goal**: The app feels complete, accessible, and production-ready for daily use.

**Depends on**: M1 through M6 complete.

---

### M7-01 — Mobile layout audit and tap target pass

The primary use case is a player logging a session on their phone at the table. Every interaction must be comfortable on a 375px viewport.

**Acceptance Criteria**:

- [ ] All interactive elements (buttons, dropdowns, inputs, icons) have a minimum tap target of 44x44px
- [ ] No horizontal overflow or clipped content at 375px viewport width
- [ ] The Start Session button and Close Session CTA are reachable without scrolling on a standard mobile screen
- [ ] The session history list and chart scroll correctly without triggering page scroll interference
- [ ] Bottom navigation (if used) does not overlap page content

---

### M7-02 — Accessibility pass

**Acceptance Criteria**:

- [ ] All form inputs have associated `<label>` elements or `aria-label` attributes
- [ ] All icon-only buttons have `aria-label` text describing the action (e.g., "Delete session")
- [ ] P&L values are never conveyed by color alone — every value includes a "+" or "-" symbol and a numeric amount in text
- [ ] Session rating (Good/Neutral/Bad) is conveyed in text, not by color alone
- [ ] Focus states are visible on all interactive elements (not removed with `outline: none` without a replacement)
- [ ] The open session banner has an accessible role and is announced to screen readers

---

### M7-03 — Loading and error states for all API calls

Every API call in the app must have a loading indicator and an error fallback so the player is never left staring at a blank screen.

**Acceptance Criteria**:

- [ ] All data-fetching operations show a loading indicator (spinner, skeleton, or disabled state) while the request is in flight
- [ ] All form submissions disable the submit button and show a loading state during the request
- [ ] All API errors surface a visible, human-readable error message to the user (not a raw JSON error or a silent failure)
- [ ] The dashboard chart and stats strip show a loading skeleton while data fetches on mount
- [ ] Network errors (fetch failures) are caught and display a "Something went wrong" message with a retry option where feasible

---

### M7-04 — App identity: icon, title, and favicon

**Acceptance Criteria**:

- [ ] Browser tab shows a meaningful page title (e.g., "Poker Tracker" or the current page name)
- [ ] A favicon is set and renders in the browser tab
- [ ] The app name or logo appears in the primary navigation/header
- [ ] Meta description tag is set for the root page

---

### M7-05 — Manual QA pass on all primary use cases

Verify every primary use case from the PRD works end-to-end in a real browser before marking V1 complete.

**Acceptance Criteria**:

- [ ] UC-01 (Start session) works on mobile (375px viewport) and desktop
- [ ] UC-02 (End session) — including start time adjustment, notes, and rating — works correctly and P&L is accurate
- [ ] UC-03 (View profit chart) renders correctly after 1, 5, and 20 sessions
- [ ] UC-04 (Session history list) shows all fields correctly and is filterable
- [ ] UC-05 (Edit past session) — P&L and duration recompute correctly after edit
- [ ] UC-06 (Manage locations) — add, edit, delete all work; deletion warning fires for in-use locations
- [ ] UC-07 (Manage stakes) — add, edit, delete all work
- [ ] UC-08 (Export) — exported JSON contains all sessions, opens as a valid file download
- [ ] UC-09 (Import) — warning dialog appears; import replaces data correctly; malformed file returns an error
- [ ] UC-10 (Delete session) — confirmation dialog appears; session is removed from list and chart
- [ ] Short session warning fires when duration is under 15 minutes and does not block close
- [ ] "Start Session" button is disabled (visually and functionally) when a session is open
- [ ] Empty states render on dashboard, history, locations, and stakes sections when no data exists
- [ ] Page refresh while a session is open preserves the open session banner
- [ ] "Use Defaults" pre-fills correctly when defaults are configured and is hidden when not

---

### M7-06 — README with local setup instructions

**Acceptance Criteria**:

- [ ] `README.md` at the project root includes: prerequisites (Node version, package manager), install steps (`npm install`), local dev command (`npm run dev`), and a brief description of the app
- [ ] No secrets, API keys, or personal data appear in the README
- [ ] Instructions work for a fresh clone of the repository

---

_All tickets cover functional requirements FR-01 through FR-33. Complete milestones in order. Each milestone produces a shippable, testable increment._
