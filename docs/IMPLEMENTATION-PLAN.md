# Make My Marriage — Implementation Plan

## Architecture summary

The application is a TypeScript Next.js App Router modular monolith. React Server
Components are the default; client components are introduced only for interactive
forms, filtering, uploads, and similar browser-only concerns. Route Handlers are
thin REST boundaries: authenticate, resolve the current wedding, validate with
Zod, call a module service, and return the standard response envelope.

MongoDB Atlas (through Mongoose) is the system of record. A Wedding is the tenant
boundary. Every private resource query and mutation must derive `weddingId` from
the server-side session/membership, never from request input. Guests remain
account-less and use high-entropy share links.

The foundation deliberately implements only base application infrastructure and
the initial account/session endpoints. It does **not** claim the remaining V1
endpoints or business features are implemented.

## Folder structure

```text
src/
├── app/                         # App Router pages and Route Handlers
│   ├── (auth)/                  # Login and signup surfaces
│   ├── api/auth/                # Implemented session endpoints
│   ├── dashboard/               # Protected dashboard shell
│   └── onboarding/              # Wedding-creation surface
├── components/
│   ├── common/
│   ├── layout/
│   └── ui/                      # Reusable presentation components
├── constants/                   # Central role and domain enum values
├── lib/                         # Framework-neutral helpers
├── modules/                     # Domain ownership: schemas, services, models
│   ├── auth/
│   ├── weddings/
│   ├── members/
│   ├── events/
│   ├── tasks/
│   ├── guests/
│   ├── expenses/
│   ├── vendors/
│   ├── photos/
│   └── email/
├── server/                      # Server-only cross-cutting infrastructure
│   ├── api/                     # Error, validation, response helpers
│   ├── auth/                    # Session resolution and authorization
│   ├── db/                      # MongoDB connection lifecycle
│   ├── email/                   # Future Resend adapter
│   ├── integrations/            # Future Google Places adapter
│   └── storage/                 # Future Cloudflare R2 adapter
└── types/
```

## Major modules and data areas

- Auth: users, hashed-password authentication, opaque server-side sessions, and
  password-reset tokens.
- Weddings and Members: the tenant/workspace, membership roles (`ADMIN` and
  `MANAGER`), and pending member invitations.
- Planning: events (archived rather than deleted) and wedding-scoped tasks.
- Guest experience: one guest record per invitation, stable private invitation
  token, event invitations, and RSVP state.
- Financial and vendors: paise-denominated INR expenses and archived vendors.
- Memories: photo metadata in MongoDB; binaries will be private Cloudflare R2
  objects, accessed through signed URLs.
- Email: MongoDB-backed asynchronous jobs for bulk guest email only.

All initial collections and their documented indexes have corresponding Mongoose
models. Wedding website, gallery configuration, and livestream configuration are
embedded in `Wedding`, rather than represented as new collections.

## Routes and access model

Current UI shells: `/`, `/login`, `/signup`, `/onboarding/create-wedding`, and
`/dashboard`. The dashboard performs a server-side session/membership check.

Implemented API foundation:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

The API design defines the future REST areas: wedding/dashboard, member
administration, events, tasks, guests/invitations/RSVPs, expenses, vendors and
vendor discovery, website/livestream/gallery/photos, email batches, public
token routes, and the internal email worker. Build each area in its owning
module and add a thin route handler only when its service and Zod contract are
ready.

## Authentication and authorization

The session cookie is named `mmm_session`, `HttpOnly`, `SameSite=Lax`, and
`Secure` in production. Browser cookies hold an opaque random token; MongoDB
stores only an HMAC-SHA-256 hash for sessions, reset tokens, and member-invite
tokens. Passwords use bcrypt hashing.

`requireWeddingMember()` resolves User → WeddingMembership → Wedding context on
the server. `requireAdmin()` is the single permission guard for membership
mutations; Managers can perform normal wedding-management work but cannot manage
members. Cross-wedding private resources must be queried with both their ID and
the resolved `weddingId`, returning `NOT_FOUND` when absent.

## Configuration and next increments

Copy `.env.example` to `.env.local` and provide MongoDB plus a distinct,
high-entropy `AUTH_TOKEN_SECRET` before running the app. R2, Resend, Google
Places, and cron credentials are intentionally optional until their modules are
implemented.

## Testing foundation

`vitest.config.mts` runs Node unit tests and resolves the `@/` alias. It replaces
Next.js's `server-only` build marker only inside the test runner, so server-only
utilities can be tested without a browser or Next.js runtime. Run `npm test` for
one CI-friendly execution or `npm run test:watch` during development. The initial
suite covers auth validation/email normalization, opaque-token handling, request
validation, and the standard error envelope. MongoDB integration, authorization,
and R2 tests should be added alongside their respective services.

Suggested delivery order follows the approved PRD: wedding creation/member
invites/dashboard; events/tasks; guests/invitations/RSVP/email; expenses/vendors;
website/livestream; then private gallery/R2 uploads and guest photo sharing.
