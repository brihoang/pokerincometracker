# Persistence Roadmap

## Phase 1 — Auth (Clerk)

**1.1 Install and configure Clerk**
- Install `@clerk/nextjs`
- Add env vars (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- Wrap app in `<ClerkProvider>` in `app/layout.tsx`
- Add Next.js middleware to protect all `/app/api` routes

**1.2 Add sign-in / sign-up pages**
- Create `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` using Clerk's pre-built components
- Add sign-in link and `<UserButton>` to NavBar

**1.3 Guard API routes**
- Add `auth()` check to every API route handler
- Return 401 if no `userId`
- No DB changes yet — localStorage still backing the data

---

## Phase 2 — Neon DB + Drizzle

**2.1 Set up Neon + Drizzle**
- Create Neon project, get connection string
- Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`
- Add `drizzle.config.ts` and `lib/db.ts` connection file

**2.2 Define schema**
- Create `lib/schema.ts` mirroring existing TypeScript types
- Tables: `sessions`, `locations`, `stakes`, `settings`
- All tables include `user_id` column for row-level isolation

**2.3 Run initial migration**
- Generate and apply migration via `drizzle-kit push`
- Verify tables exist in Neon console

---

## Phase 3 — Repository swap

**3.1 Swap sessions repository**
- Replace localStorage reads/writes in `lib/repositories/sessions.ts` with Drizzle queries scoped by `userId`

**3.2 Swap locations, stakes, settings repositories**
- Same swap for `lib/repositories/locations.ts`, `stakes.ts`, `settings.ts`

**3.3 Update isLoggedIn() and client service layer**
- `isLoggedIn()` returns `true` when Clerk session exists
- Client service layer (`lib/client/`) routes through API calls when logged in

---

## Phase 4 — Existing data migration

**4.1 Update import route for authenticated use**
- `POST /api/import` attaches `userId` from Clerk session to all imported records

**4.2 Build migration prompt UI**
- On first login, detect if localStorage contains data
- Show a one-time prompt offering to upload existing data to the account
- On confirm, call `POST /api/import` with localStorage data

**4.3 Clear localStorage post-migration**
- On successful import, wipe all `PIT_*` localStorage keys
- Mark migration as done (e.g. `PIT_MIGRATED` flag) to suppress prompt on future logins
