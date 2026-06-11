# Nairobi Creators Booking Platform

A booking infrastructure that connects clients with Nairobi-based creators (photographers, videographers, DJs, and other event talent). Clients submit a booking request, available creators are pinged, creators accept or decline, and the client confirms a single creator — all backed by a secure role-based dashboard for admins and creators.

Built on **TanStack Start** (React 19 + Vite 7) with **Lovable Cloud** for database, auth, and server functions.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Getting Started](#getting-started)
5. [Booking Flow](#booking-flow)
6. [Authentication & Roles](#authentication--roles)
7. [Admin Dashboard](#admin-dashboard)
8. [Creator Dashboard](#creator-dashboard)
9. [Database Schema](#database-schema)
10. [Routes Reference](#routes-reference)
11. [Server Functions Reference](#server-functions-reference)
12. [Project Structure](#project-structure)
13. [Environment & Secrets](#environment--secrets)
14. [Deployment](#deployment)

---

## Features

- **Public landing page** showcasing creators with craft, area, rate, and availability.
- **Multi-creator booking requests** — clients select one or more creators for a date; conflicts are detected automatically.
- **Magic-link creator responses** — creators get a unique link to accept/decline without an account.
- **Client status page** — clients track responses and confirm their chosen creator via a token URL.
- **Role-based authenticated dashboard** for admins and signed-in creators.
- **Admin tooling** — live request feed, status overrides (mark done, cancel), and creator onboarding (link creators to email accounts).
- **Email + Google sign-in** powered by Lovable Cloud auth.
- **Row-Level Security** on every public table, with a `has_role()` security-definer function for safe role checks.

---

## Tech Stack

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Framework        | TanStack Start v1 (React 19, file-based routing)    |
| Build tool       | Vite 7                                              |
| Styling          | Tailwind CSS v4 + shadcn/ui                         |
| Backend          | Lovable Cloud (Postgres, Auth, Storage)             |
| Server logic     | TanStack `createServerFn` (typed RPC)               |
| Forms / validation | React Hook Form + Zod                             |
| Data fetching    | TanStack Query                                      |
| Runtime          | Edge (Cloudflare Workers via TanStack Start)        |

---

## Architecture Overview

```text
                 ┌─────────────────────────┐
                 │  Public site (index)    │
                 │  - Creator gallery      │
                 │  - Booking form         │
                 └───────────┬─────────────┘
                             │ submitBookingRequest()
                             ▼
              ┌────────────────────────────────┐
              │  Server functions (RPC)        │
              │  src/lib/*.functions.ts        │
              │  - booking.functions.ts        │
              │  - auth.functions.ts           │
              └───────────┬────────────────────┘
                          │ supabaseAdmin (service role)
                          ▼
              ┌────────────────────────────────┐
              │  Lovable Cloud (Postgres)      │
              │  - creators, booking_*, roles  │
              │  - RLS + has_role() function   │
              └────────────────────────────────┘
                          ▲
                          │ supabase client (anon, RLS)
                          │
   ┌─────────────────┐    │    ┌────────────────────────────┐
   │ Magic-link page │────┘    │ /_authenticated/dashboard  │
   │ /respond/$token │         │  - Admin view              │
   │ /booking/$token │         │  - Creator view            │
   └─────────────────┘         └────────────────────────────┘
```

Three audiences, three entry points:

1. **Clients** — public site, status page via confirmation token, no account needed.
2. **Creators** — magic-link response page (no account) **or** authenticated dashboard once an admin links them.
3. **Admins** — authenticated dashboard with full visibility and overrides.

---

## Getting Started

### Prerequisites

- Node 20+ and [Bun](https://bun.sh)
- A Lovable Cloud project (auto-provisioned for Lovable workspaces)

### Install & run

```bash
bun install
bun run dev
```

The dev server runs at `http://localhost:5173`. Routes are auto-discovered from `src/routes/`.

### First-time setup

1. Open `/auth` and sign up with **`alnodmunene@gmail.com`** to claim the bootstrap admin role.
   (To use a different admin email, edit the bootstrap clause in `supabase/migrations/20260609193514_*.sql` before applying.)
2. Open `/dashboard` → **Creators** tab → assign emails to existing creator profiles.
3. Each invited creator signs up at `/auth` using the assigned email and lands on their personalized dashboard.

---

## Booking Flow

```text
Client            Server                Creator (magic link)        Admin
  │                  │                         │                       │
  │  Submit request  │                         │                       │
  ├─────────────────▶│                         │                       │
  │                  │ insert booking_requests │                       │
  │                  │ ping selected creators  │                       │
  │                  │  (skip conflicts)       │                       │
  │  token URL       │                         │                       │
  │◀─────────────────┤                         │                       │
  │                  │  response link emailed* │                       │
  │                  ├────────────────────────▶│                       │
  │                  │                Accept / Decline                 │
  │                  │◀────────────────────────┤                       │
  │                  │ first accept → status=  │                       │
  │                  │ client_review           │                       │
  │  status page     │                         │                       │
  │◀─────────────────┤                         │                       │
  │ Confirm creator  │                         │                       │
  ├─────────────────▶│                         │                       │
  │                  │ status=confirmed        │                       │
  │                  │                         │     Live feed visible │
  │                  ├──────────────────────────────────────────────▶ │
```

\*Email delivery is not wired by default; the response link is generated and exposed via the admin feed for now. Add an email integration to send `/respond/$token` automatically.

### Status lifecycle

`notified` → `client_review` (after first acceptance) → `confirmed` | `canceled` | `done`

---

## Authentication & Roles

- **Provider:** Lovable Cloud Auth (Email/Password + Google OAuth).
- **Roles:** stored in a separate `user_roles` table — **never** on `profiles`. This prevents privilege-escalation attacks.
- **Enum:** `app_role` = `'admin' | 'creator'`.
- **Helper:** `public.has_role(_user_id uuid, _role app_role)` — `SECURITY DEFINER` SQL function used inside RLS policies and inside server functions to authorize the caller.

### Server-side authorization pattern

Every privileged server function uses the `requireSupabaseAuth` middleware and then checks `has_role`:

```ts
export const adminAction = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase
      .rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!isAdmin) throw new Error('Forbidden');
    // ...
  });
```

### Route protection

- `/auth` — public sign-in/sign-up.
- `/_authenticated/*` — guarded layout; `beforeLoad` redirects unauthenticated users to `/auth`.
- `/respond/$token`, `/booking/$token` — public, secured by unguessable tokens.

---

## Admin Dashboard

Path: `/dashboard` (when signed in as admin)

- **Requests tab** — live feed of every booking with status pills, accept/decline counts, and per-creator response links. Admins can **Mark Done** or **Cancel** any request.
- **Creators tab** — assign/unassign creator profiles to email accounts. Once linked, the creator sees their personal dashboard after signing up with that email.

---

## Creator Dashboard

Path: `/dashboard` (when signed in as a linked creator)

- Shows only requests where the creator is in `booking_request_creators`.
- In-app **Accept** / **Decline** actions (in addition to the magic-link flow).
- Status pills mirror the public flow: `pending`, `accepted`, `declined`, `confirmed`.

---

## Database Schema

All tables live in the `public` schema. Every table has RLS enabled and explicit `GRANT`s.

| Table                       | Purpose                                                              |
| --------------------------- | -------------------------------------------------------------------- |
| `creators`                  | Public creator profiles (name, craft, area, rate, image, sort order, optional `auth_user_id` + `email` linkage). |
| `creator_busy_dates`        | Unavailable dates per creator; used for conflict detection.          |
| `booking_requests`          | Top-level client request (date, type, hours, venue, email, status, `confirmation_token`, optional `chosen_creator_id`). |
| `booking_request_creators`  | Many-to-many between a request and the creators pinged for it; carries each creator's `status` and unique `response_token`. |
| `booking_status_events`     | Append-only audit log of state transitions (notified, accepted, declined, confirmed, canceled, …). |
| `profiles`                  | One row per auth user (display info only — **never** roles).         |
| `user_roles`                | `(user_id, role)` — the source of truth for authorization.           |

Migrations live in `supabase/migrations/`.

---

## Routes Reference

| Route                              | Audience            | Purpose                                              |
| ---------------------------------- | ------------------- | ---------------------------------------------------- |
| `/`                                | Public              | Landing page, creator gallery, booking form          |
| `/auth`                            | Public              | Sign in / sign up (email + Google)                   |
| `/booking/$token`                  | Public (tokenized)  | Client status page; confirm or cancel                |
| `/respond/$token`                  | Public (tokenized)  | Creator magic-link accept/decline                    |
| `/_authenticated/dashboard`        | Admin or creator    | Role-aware dashboard                                 |

---

## Server Functions Reference

All in `src/lib/`:

### `booking.functions.ts`

- `listCreatorsWithBusy()` — creators + their upcoming busy dates.
- `submitBookingRequest({ event_date, event_type, hours, venue, email, creator_ids })` — creates a request, pings non-conflicting creators, returns a confirmation token.
- `getRequestByToken({ token })` — fetches the full request for the client status page.
- `getResponseContext({ token })` — loads context for the creator magic-link page.
- `respondToRequest({ token, action })` — creator accept/decline via magic link.
- `confirmBooking({ token, creator_id })` — client confirms their chosen creator.
- `cancelBooking({ token })` — client cancels (only if not yet confirmed).
- `listAdminFeed({ key })` — legacy key-gated admin feed (kept for backward compatibility).

### `auth.functions.ts`

- `getMe()` — returns the signed-in user, profile, and roles.
- `listMyAssignments()` — requests where the signed-in creator is assigned.
- `respondAsCreator({ request_id, action })` — in-dashboard accept/decline.
- `adminListRequests()`, `adminUpdateRequestStatus()`, `adminListCreators()`, `adminLinkCreatorEmail()` — admin-only operations, each guarded by `has_role(..., 'admin')`.

---

## Project Structure

```text
src/
├── routes/
│   ├── __root.tsx                 # App shell + auth listener
│   ├── index.tsx                  # Landing + booking form
│   ├── auth.tsx                   # Sign in / sign up
│   ├── booking.$token.tsx         # Client status page
│   ├── respond.$token.tsx         # Creator magic-link
│   └── _authenticated/
│       ├── route.tsx              # Auth gate (redirects to /auth)
│       └── dashboard.tsx          # Admin + creator dashboard
├── lib/
│   ├── booking.functions.ts       # Booking RPCs
│   ├── auth.functions.ts          # Auth/role RPCs
│   └── config.server.ts
├── integrations/supabase/         # Auto-generated clients — do not edit
├── components/ui/                 # shadcn/ui primitives
├── router.tsx                     # TanStack Router setup
└── start.ts                       # Global middleware (attachSupabaseAuth)

supabase/migrations/               # SQL migrations (schema, RLS, roles)
```

---

## Environment & Secrets

Lovable Cloud injects these automatically — **do not** commit secrets to `.env`.

| Variable                          | Where           | Notes                                        |
| --------------------------------- | --------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`               | Browser + server| Public, build-time                           |
| `VITE_SUPABASE_PUBLISHABLE_KEY`   | Browser + server| Public, build-time                           |
| `SUPABASE_SERVICE_ROLE_KEY`       | Server only     | Bypasses RLS — never imported client-side    |
| `ADMIN_DASHBOARD_KEY`             | Server only     | Legacy key for `listAdminFeed`               |

Manage runtime secrets via **Project Settings → Secrets**.

---

## Deployment

Click **Publish** in Lovable. The app deploys to the edge runtime with two stable URLs:

- `project--<id>.lovable.app` — production
- `project--<id>-dev.lovable.app` — latest preview

Server functions run as TanStack Start server endpoints on Cloudflare Workers (with `nodejs_compat`). No separate backend service is required.

---

## Security Notes

- **Roles are never trusted from the client.** Always re-check with `has_role()` on the server.
- **Service-role client (`client.server.ts`) is loaded lazily** inside handler bodies — never at module scope outside `*.server.ts` files.
- **Magic-link tokens** (`response_token`, `confirmation_token`) are random and single-purpose. Treat them as bearer credentials.
- **RLS is enabled on every public table** with explicit grants. Adding a new table? Follow the canonical pattern: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`.

---

## License

Proprietary — all rights reserved.
