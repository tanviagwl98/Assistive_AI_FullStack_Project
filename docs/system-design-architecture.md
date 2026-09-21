# MY MARRIAGE
## System Design & Architecture Document

**Product:** My Marriage  
**Architecture:** Modular Monolith  
**Frontend:** Next.js / React / TypeScript  
**Backend:** Node.js / Express.js  
**Database:** MongoDB  
**ODM:** Mongoose  
**Storage:** S3-compatible Object Storage  
**API Style:** REST  
**Deployment:** Docker + GitHub Actions  

---

# 1. Architecture Overview

My Marriage is designed as a **modular monolith**: one deployable backend application containing clearly separated business modules.

The architecture is intentionally not microservices-first. The product has many strongly connected domains such as weddings, events, guests, invitations, RSVPs, vendors, expenses, accommodation, transportation, documents, and wedding-day execution. Keeping these domains inside one application simplifies transactions, development, testing, deployment, and local development while preserving clear module boundaries for future extraction if scale requires it.

## High-Level Architecture

```text
                                    ┌─────────────────────┐
                                    │       Users         │
                                    │                     │
                                    │ Couple / Family     │
                                    │ Coordinator / Vendor│
                                    │ Guest               │
                                    └──────────┬──────────┘
                                               │
                                               │ HTTPS
                                               ▼
                              ┌──────────────────────────────┐
                              │          Cloudflare          │
                              │ CDN / DNS / TLS / WAF       │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │                             │
                              ▼                             ▼
                    ┌──────────────────┐        ┌──────────────────┐
                    │  Next.js Web App │        │  Public Website  │
                    │ React + TypeScript│       │ Wedding Pages    │
                    └────────┬─────────┘        └────────┬─────────┘
                             │                           │
                             └─────────────┬─────────────┘
                                           │ REST / HTTPS
                                           ▼
                         ┌────────────────────────────────────┐
                         │       Node.js + Express API        │
                         │          Modular Monolith          │
                         │                                    │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │    Auth    │ │   Wedding     │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │   Events   │ │    Guests     │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │    Tasks   │ │    Vendors    │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │  Expenses  │ │  Invitations  │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │    RSVP    │ │ Accommodation │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │ Transport  │ │  Documents    │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │  Website   │ │ Notifications │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │ Wedding Day│ │   Memories    │ │
                         │  └────────────┘ └───────────────┘ │
                         │  ┌────────────┐ ┌───────────────┐ │
                         │  │   Issues   │ │    Analytics  │ │
                         │  └────────────┘ └───────────────┘ │
                         └───────────────┬────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
             ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
             │ PostgreSQL   │     │ Object       │     │ Redis        │
             │ + Prisma     │     │ Storage      │     │ Optional/MVP │
             └──────────────┘     └──────────────┘     └──────┬───────┘
                                                               │
                                                               ▼
                                                        ┌──────────────┐
                                                        │ BullMQ Worker│
                                                        │ Background   │
                                                        │ Jobs         │
                                                        └──────┬───────┘
                                                               │
                         ┌─────────────────────────────────────┼──────────────┐
                         ▼                                     ▼              ▼
                  Email Provider                       SMS/WhatsApp     Other APIs
```

---

# 2. Architecture Principles

## 2.1 Modular Monolith

The backend is one application but is divided into business modules. Modules communicate through application services and domain events rather than directly accessing another module's internal implementation.

```text
modules/
├── auth/
├── wedding/
├── events/
├── members/
├── guests/
├── tasks/
├── vendors/
├── expenses/
├── invitations/
├── rsvp/
├── accommodation/
├── transport/
├── documents/
├── website/
├── notifications/
├── wedding-day/
├── memories/
├── issues/
└── analytics/
```

## 2.2 Wedding as the Tenant Boundary

Every wedding is treated as an isolated tenant/business workspace.

```text
User
  │
  ├── Wedding A
  │     ├── Events
  │     ├── Guests
  │     ├── Vendors
  │     └── Expenses
  │
  └── Wedding B
        ├── Events
        ├── Guests
        ├── Vendors
        └── Expenses
```

Every tenant-owned query must be scoped by `wedding_id` or derive the wedding context through an authorized relationship.

## 2.3 Event as a Secondary Access Boundary

The most important domain rule is:

```text
Wedding → Event → EventGuest → Guest
```

A guest can belong to a wedding while having access to only selected events.

```text
Wedding
   │
   ├── Mehendi
   ├── Sangeet
   ├── Wedding
   └── Reception

Guest A
   ├── Mehendi      ❌
   ├── Sangeet      ✅
   ├── Wedding      ✅
   └── Reception    ✅
```

This relationship must be enforced at the backend authorization layer, not only in the frontend.

## 2.4 Backend as the Source of Truth

Frontend permission checks improve UX but do not provide security. Every protected operation must be authorized by the backend.

## 2.5 Reuse Data Across Features

The same wedding/event data should power:

```text
Wedding Data
     │
     ├── Dashboard
     ├── Invitations
     ├── RSVP
     ├── Wedding Website
     ├── Guest Portal
     ├── Wedding Day Mode
     └── Analytics
```

This avoids duplicate data entry.

---

# 3. C4-Style System Context

```text
                         ┌───────────────────────────┐
                         │          Couple            │
                         └─────────────┬─────────────┘
                                       │
                         ┌─────────────▼─────────────┐
                         │                           │
                         │       MY MARRIAGE         │
                         │                           │
                         │ Wedding Planning &        │
                         │ Management Platform       │
                         │                           │
                         └─────────────┬─────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
       Family/Admin              Coordinator                 Vendor
              │                        │                        │
              └────────────────────────┼────────────────────────┘
                                       │
                                       ▼
                                    Guest
```

External systems:

```text
My Marriage
    │
    ├── Email Provider
    ├── Optional SMS Provider
    ├── Optional WhatsApp Provider
    ├── Maps Provider
    ├── External Live Streaming Provider
    ├── Object Storage
    └── Optional OAuth Provider (Google)
```

---

# 4. Application Layer Architecture

The backend should follow a layered structure inside every module.

```text
HTTP Request
     │
     ▼
┌───────────────┐
│ Route         │
└───────┬───────┘
        ▼
┌───────────────┐
│ Controller    │  HTTP concerns only
└───────┬───────┘
        ▼
┌───────────────┐
│ Validation    │  Zod schemas
└───────┬───────┘
        ▼
┌───────────────┐
│ Application    │  Use cases
│ Service       │
└───────┬───────┘
        ▼
┌───────────────┐
│ Domain Logic  │  Business rules
└───────┬───────┘
        ▼
┌───────────────┐
│ Repository    │  Data access
└───────┬───────┘
        ▼
┌───────────────┐
│ Prisma ORM    │
└───────┬───────┘
        ▼
┌───────────────┐
│ PostgreSQL    │
└───────────────┘
```

External services should be accessed through adapters/interfaces rather than being embedded directly inside business logic.

---

# 5. Backend Module Boundaries

## 5.1 Auth Module

Responsibilities:

- Registration
- Login
- Logout
- Password reset
- Session/token management
- Optional Google OAuth
- User profile

Does not own wedding permissions. Wedding membership and resource authorization belong to the membership/authorization layer.

## 5.2 Wedding Module

Responsibilities:

- Create wedding
- Update wedding information
- Wedding settings
- Wedding privacy
- Wedding lifecycle
- Budget configuration

Owns the root `Wedding` entity.

## 5.3 Members & Authorization Module

Responsibilities:

- Add/remove wedding members
- Assign roles
- Permission management
- Wedding-level authorization
- Event-level authorization helpers

Example roles:

```text
OWNER
ADMIN
FAMILY_MEMBER
EVENT_MANAGER
VENDOR
GUEST
```

## 5.4 Events Module

Responsibilities:

- Create/update/delete/archive events
- Event scheduling
- Event venue
- Event metadata
- Event ordering
- Event calendar/timeline

## 5.5 Guests Module

Responsibilities:

- Guest directory
- Contact information
- Household/family grouping
- Guest notes
- Plus-one information
- Guest status

## 5.6 EventGuest Module

Responsibilities:

- Event invitation assignment
- Event-level authorization
- Event RSVP relationship
- Event check-in relationship
- Event invitation state

This is a critical module.

## 5.7 Tasks Module

Responsibilities:

- Tasks
- Assignment
- Priority
- Due dates
- Kanban state
- Attachments
- Task reminders

## 5.8 Vendors Module

Responsibilities:

- Vendor profiles
- Event-vendor relationships
- Contracts
- Quoted/agreed amounts
- Vendor payments
- Vendor notes

## 5.9 Expenses Module

Responsibilities:

- Budget
- Expenses
- Categories
- Payments
- Receipts
- Pending amounts
- Budget calculations

## 5.10 Invitations Module

Responsibilities:

- Invitation templates
- Invitation generation
- Unique links
- Invitation delivery status
- Invitation/event mapping

## 5.11 RSVP Module

Responsibilities:

- Event-specific RSVP
- Attendee count
- Meal preferences
- Accommodation requirement
- Transport requirement
- RSVP statistics

## 5.12 Accommodation Module

Responsibilities:

- Hotels
- Rooms
- Guest assignments
- Check-in/out
- Accommodation payments

## 5.13 Transport Module

Responsibilities:

- Vehicles
- Drivers
- Pickup points
- Drop points
- Schedules
- Guest assignments

## 5.14 Documents Module

Responsibilities:

- Contracts
- Receipts
- Invoices
- Marriage-related documents
- Travel/accommodation documents
- Registration checklist
- Role-based access

## 5.15 Website Module

Responsibilities:

- Wedding website configuration
- Public/private settings
- Published content
- Theme/template configuration
- Data projection from wedding/event records

## 5.16 Notifications Module

Responsibilities:

- Notification preferences
- Notification templates
- In-app notifications
- Email notifications
- Future SMS/WhatsApp adapters
- Reminder scheduling

## 5.17 Wedding Day Module

Responsibilities:

- Current event
- Event timeline
- Critical tasks
- Vendor contacts
- Emergency contacts
- Wedding-day operational dashboard

## 5.18 Check-In Module

Responsibilities:

- QR validation
- Event access validation
- Guest check-in
- Check-in timestamps
- Event attendance metrics

## 5.19 Memories Module

Responsibilities:

- Albums
- Photos
- Guest uploads
- Moderation
- Event tagging
- Download/share permissions

## 5.20 Issues Module

Responsibilities:

- Wedding-day issues
- Priority
- Assignment
- Status
- Attachments
- Resolution tracking

## 5.21 Analytics Module

Responsibilities:

- Wedding metrics
- RSVP metrics
- Guest check-in metrics
- Task completion
- Expense summary
- Vendor summary
- Accommodation/transport summary

Analytics should primarily read data from other modules rather than owning operational data.

---

# 6. Domain Relationship Model

```text
User
 │
 ├───────────────< WeddingMember >────────────── Wedding
 │                                                   │
 │                                                   ├──< Event
 │                                                   │      │
 │                                                   │      └──< EventGuest >── Guest
 │                                                   │
 │                                                   ├──< Task
 │                                                   │
 │                                                   ├──< Vendor
 │                                                   │      │
 │                                                   │      └──< EventVendor >── Event
 │                                                   │
 │                                                   ├──< Expense
 │                                                   │
 │                                                   ├──< Invitation
 │                                                   │      │
 │                                                   │      └── Guest
 │                                                   │
 │                                                   ├──< Website
 │                                                   │
 │                                                   ├──< Document
 │                                                   │
 │                                                   ├──< Album
 │                                                   │      │
 │                                                   │      └──< Photo
 │                                                   │
 │                                                   ├──< Accommodation
 │                                                   │
 │                                                   ├──< Transport
 │                                                   │
 │                                                   └──< Issue
```

---

# 7. Core Database Design

PostgreSQL is the primary database because the product has highly relational data and requires strong consistency between entities.

## Core Tables

```text
users
weddings
wedding_members
roles
permissions
role_permissions

 events
guests
event_guests

 tasks
task_assignees

 vendors
event_vendors

 expenses
expense_categories
payments

 invitations
invitation_events

 rsvps
reminders
notifications

 venues

 accommodations
rooms
guest_rooms

 transports
vehicles
drivers
guest_transports

 documents

 websites
website_settings

 albums
photos
photo_uploads

 live_streams
issues

 audit_logs
```

---

# 8. Important Entity Relationships

## Wedding → Events

```text
Wedding 1 ─────────── N Events
```

## Wedding → Guests

```text
Wedding 1 ─────────── N Guests
```

## Event ↔ Guest

Many-to-many through `event_guests`:

```text
Event 1 ─────── N EventGuest N ─────── 1 Guest
```

## Event ↔ Vendor

```text
Event 1 ─────── N EventVendor N ─────── 1 Vendor
```

## Event → RSVP

RSVP should be associated with `event_guest`, not only `guest`.

```text
Guest
  │
  ▼
EventGuest
  │
  ▼
RSVP
```

## Event → Check-In

```text
EventGuest
    │
    ▼
CheckIn
```

## Wedding → Expense

Expenses may optionally reference an event and/or vendor.

```text
Wedding
   │
   └── Expense ── optional ── Event
                  optional ── Vendor
```

---

# 9. Suggested Database Schema

## users

```text
id UUID PK
name VARCHAR
email VARCHAR UNIQUE
phone VARCHAR
password_hash VARCHAR
profile_image_url VARCHAR NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

## weddings

```text
id UUID PK
owner_id UUID FK users.id
name VARCHAR
couple_name_1 VARCHAR
couple_name_2 VARCHAR
wedding_date DATE NULL
city VARCHAR NULL
venue_name VARCHAR NULL
venue_address TEXT NULL
budget DECIMAL NULL
privacy_status VARCHAR
status VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

## wedding_members

```text
id UUID PK
wedding_id UUID FK
user_id UUID FK
role_id UUID FK
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE(wedding_id, user_id)
```

## events

```text
id UUID PK
wedding_id UUID FK
name VARCHAR
description TEXT NULL
event_date DATE
start_time TIME NULL
end_time TIME NULL
venue_name VARCHAR NULL
venue_address TEXT NULL
dress_code VARCHAR NULL
notes TEXT NULL
sort_order INTEGER
status VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

## guests

```text
id UUID PK
wedding_id UUID FK
household_id UUID NULL
name VARCHAR
email VARCHAR NULL
phone VARCHAR NULL
relationship VARCHAR NULL
address TEXT NULL
plus_one_allowed BOOLEAN
notes TEXT NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

## event_guests

```text
id UUID PK
event_id UUID FK
guest_id UUID FK
invitation_status VARCHAR
rsvp_status VARCHAR
check_in_status VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE(event_id, guest_id)
```

## tasks

```text
id UUID PK
wedding_id UUID FK
event_id UUID NULL FK
title VARCHAR
description TEXT NULL
priority VARCHAR
status VARCHAR
due_date TIMESTAMP NULL
created_by UUID FK
created_at TIMESTAMP
updated_at TIMESTAMP
```

## vendors

```text
id UUID PK
wedding_id UUID FK
name VARCHAR
category VARCHAR
phone VARCHAR NULL
email VARCHAR NULL
address TEXT NULL
quoted_amount DECIMAL NULL
agreed_amount DECIMAL NULL
paid_amount DECIMAL DEFAULT 0
status VARCHAR
notes TEXT NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

## event_vendors

```text
id UUID PK
event_id UUID FK
vendor_id UUID FK
notes TEXT NULL
created_at TIMESTAMP

UNIQUE(event_id, vendor_id)
```

## expenses

```text
id UUID PK
wedding_id UUID FK
event_id UUID NULL FK
vendor_id UUID NULL FK
category_id UUID FK
title VARCHAR
amount DECIMAL
paid_amount DECIMAL
payment_status VARCHAR
payment_method VARCHAR NULL
expense_date DATE NULL
notes TEXT NULL
created_by UUID FK
created_at TIMESTAMP
updated_at TIMESTAMP
```

## invitations

```text
id UUID PK
wedding_id UUID FK
guest_id UUID FK
token_hash VARCHAR UNIQUE
status VARCHAR
sent_at TIMESTAMP NULL
opened_at TIMESTAMP NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

## rsvps

```text
id UUID PK
event_guest_id UUID FK UNIQUE
response VARCHAR
attendee_count INTEGER
a ccommodation_required BOOLEAN
transport_required BOOLEAN
meal_preference VARCHAR NULL
submitted_at TIMESTAMP NULL
updated_at TIMESTAMP
```

## documents

```text
id UUID PK
wedding_id UUID FK
event_id UUID NULL FK
uploaded_by UUID FK
category VARCHAR
file_name VARCHAR
storage_key VARCHAR
mime_type VARCHAR
file_size BIGINT
visibility VARCHAR
created_at TIMESTAMP
```

## photos

```text
id UUID PK
wedding_id UUID FK
event_id UUID NULL FK
album_id UUID NULL FK
uploaded_by UUID FK
storage_key VARCHAR
mime_type VARCHAR
file_size BIGINT
moderation_status VARCHAR
created_at TIMESTAMP
```

---

# 10. Multi-Tenancy Strategy

My Marriage should use **logical multi-tenancy** with PostgreSQL.

Every tenant-owned table contains `wedding_id` directly where practical.

Example:

```sql
SELECT *
FROM guests
WHERE wedding_id = :weddingId;
```

Never allow a client to choose a wedding ID without validating that the authenticated user has access to that wedding.

## Request Context

```text
JWT / Session
      │
      ▼
Authenticated User
      │
      ▼
Wedding Membership
      │
      ▼
Authorized Wedding Context
      │
      ▼
Business Operation
```

---

# 11. Authorization Architecture

Authorization should happen in multiple layers.

```text
                    Request
                       │
                       ▼
              Authentication
                       │
                       ▼
               Identify User
                       │
                       ▼
            Wedding Membership
                       │
                       ▼
               Role Permission
                       │
                       ▼
            Resource Ownership
                       │
                       ▼
             Event-Level Access
                       │
                       ▼
                 Controller
```

Example guest request:

```text
GET /api/events/:eventId
        │
        ▼
Is user authenticated?
        │
        ▼
Does guest belong to this wedding?
        │
        ▼
Does EventGuest exist?
        │
        ▼
Is guest allowed to view event?
        │
        ▼
Return event
```

---

# 12. RBAC + Resource Authorization

Permissions should be explicit rather than hardcoded throughout controllers.

Example:

```text
VIEW_WEDDING
EDIT_WEDDING
MANAGE_MEMBERS
MANAGE_EVENTS
MANAGE_GUESTS
MANAGE_TASKS
MANAGE_EXPENSES
MANAGE_VENDORS
SEND_INVITATIONS
MANAGE_RSVP
MANAGE_ACCOMMODATION
MANAGE_TRANSPORT
MANAGE_DOCUMENTS
UPLOAD_PHOTOS
MANAGE_WEBSITE
MANAGE_WEDDING_DAY
```

Example mapping:

```text
OWNER
 └── All wedding permissions

ADMIN
 └── Most operational permissions

FAMILY_MEMBER
 └── Permissions explicitly assigned

EVENT_MANAGER
 └── Event-specific permissions

VENDOR
 └── Vendor-specific access

GUEST
 └── Guest/event-specific read + RSVP permissions
```

---

# 13. API Architecture

Use versioned REST APIs.

```text
/api/v1
```

## Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

## Weddings

```http
POST   /api/v1/weddings
GET    /api/v1/weddings
GET    /api/v1/weddings/:weddingId
PATCH  /api/v1/weddings/:weddingId
DELETE /api/v1/weddings/:weddingId
```

## Events

```http
POST   /api/v1/weddings/:weddingId/events
GET    /api/v1/weddings/:weddingId/events
GET    /api/v1/events/:eventId
PATCH  /api/v1/events/:eventId
DELETE /api/v1/events/:eventId
```

## Guests

```http
POST   /api/v1/weddings/:weddingId/guests
GET    /api/v1/weddings/:weddingId/guests
GET    /api/v1/guests/:guestId
PATCH  /api/v1/guests/:guestId
DELETE /api/v1/guests/:guestId
```

## Event Guests

```http
POST   /api/v1/events/:eventId/guests
GET    /api/v1/events/:eventId/guests
DELETE /api/v1/events/:eventId/guests/:guestId
```

## Tasks

```http
POST   /api/v1/weddings/:weddingId/tasks
GET    /api/v1/weddings/:weddingId/tasks
GET    /api/v1/tasks/:taskId
PATCH  /api/v1/tasks/:taskId
DELETE /api/v1/tasks/:taskId
```

## Expenses

```http
POST   /api/v1/weddings/:weddingId/expenses
GET    /api/v1/weddings/:weddingId/expenses
GET    /api/v1/expenses/:expenseId
PATCH  /api/v1/expenses/:expenseId
DELETE /api/v1/expenses/:expenseId
```

## Vendors

```http
POST   /api/v1/weddings/:weddingId/vendors
GET    /api/v1/weddings/:weddingId/vendors
PATCH  /api/v1/vendors/:vendorId
DELETE /api/v1/vendors/:vendorId
```

## Invitations

```http
POST /api/v1/weddings/:weddingId/invitations
GET  /api/v1/weddings/:weddingId/invitations
POST /api/v1/invitations/:invitationId/send
GET  /api/v1/public/invitations/:token
```

## RSVP

```http
POST /api/v1/event-guests/:eventGuestId/rsvp
GET  /api/v1/weddings/:weddingId/rsvps
```

## Dashboard

```http
GET /api/v1/weddings/:weddingId/dashboard
```

## Wedding Day

```http
GET /api/v1/weddings/:weddingId/wedding-day
GET /api/v1/events/:eventId/check-in
POST /api/v1/events/:eventId/check-in
```

---

# 14. API Response Standard

Successful response:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "EVENT_ACCESS_DENIED",
    "message": "You do not have access to this event."
  }
}
```

Pagination:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  }
}
```

---

# 15. Dashboard Architecture

The dashboard is an aggregation layer rather than a separate data store.

```text
                         Dashboard API
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
     Wedding                Events                Tasks
        │                     │                     │
        └──────────────┬──────┴──────────────┬──────┘
                       ▼                     ▼
                    Guests                Expenses
                       │                     │
                       └──────────┬──────────┘
                                  ▼
                            Dashboard DTO
                                  │
                                  ▼
                               Frontend
```

Suggested response:

```json
{
  "wedding": {},
  "countdown": {},
  "nextEvent": {},
  "upcomingEvents": [],
  "tasks": {
    "total": 0,
    "completed": 0,
    "pending": 0,
    "blocked": 0
  },
  "guests": {
    "total": 0,
    "confirmed": 0,
    "pending": 0,
    "declined": 0
  },
  "expenses": {
    "budget": 0,
    "planned": 0,
    "spent": 0,
    "remaining": 0,
    "pending": 0
  }
}
```

---

# 16. Invitation and RSVP Flow

```text
Couple
  │
  ▼
Select Guests
  │
  ▼
Select Events
  │
  ▼
Generate Invitation
  │
  ▼
Unique Invitation Token
  │
  ▼
Send Invitation
  │
  ▼
Guest Opens Link
  │
  ▼
Token Validation
  │
  ▼
Authorized Events Only
  │
  ▼
Guest Submits RSVP
  │
  ▼
EventGuest + RSVP Updated
  │
  ▼
Dashboard Updated
```

The invitation token should not expose internal database identifiers directly. Store a secure token/hash representation and resolve it server-side.

---

# 17. Wedding Website Architecture

The wedding website should be a read-oriented projection of existing wedding data.

```text
PostgreSQL
    │
    ▼
Website Service
    │
    ├── Couple Data
    ├── Events
    ├── Venue
    ├── Schedule
    ├── RSVP
    └── Gallery
    │
    ▼
Public Wedding Website
```

Example:

```text
my-marriage.com/w/tanvi-and-xyz
```

Publishing should support:

```text
DRAFT → PREVIEW → PUBLISHED → UNPUBLISHED
```

---

# 18. File and Media Architecture

Binary files should not be stored in PostgreSQL.

```text
Frontend
   │
   ▼
Request Upload URL
   │
   ▼
Backend validates permission
   │
   ▼
Signed Upload URL
   │
   ▼
Object Storage
   │
   ▼
Metadata stored in PostgreSQL
```

Storage layout:

```text
/my-marriage/
    /weddings/{weddingId}/
        /documents/
        /contracts/
        /receipts/
        /albums/{albumId}/
        /photos/{eventId}/
        /invitations/
```

Use signed URLs for private files.

---

# 19. Notification Architecture

Notifications should be asynchronous where possible.

```text
Business Event
     │
     ▼
Notification Service
     │
     ▼
Queue
     │
     ▼
Worker
     │
     ├── Email Adapter
     ├── SMS Adapter
     └── WhatsApp Adapter
```

Examples of domain events:

```text
RSVP_SUBMITTED
RSVP_REMINDER_DUE
TASK_DUE_SOON
VENDOR_PAYMENT_DUE
EVENT_UPCOMING
ACCOMMODATION_CHECKIN_SOON
TRANSPORT_DEPARTURE_SOON
```

For the MVP, email and in-app notifications can be implemented first. Redis/BullMQ can be introduced when scheduled jobs and notification volume justify it.

---

# 20. Background Job Architecture

Jobs should handle operations that should not block the main API request.

```text
Express API
    │
    ├── Create RSVP
    │
    └── Enqueue notification job
                │
                ▼
              Redis
                │
                ▼
             BullMQ
                │
                ▼
              Worker
                │
                ▼
          Email / SMS / WhatsApp
```

Potential jobs:

- RSVP reminders
- Event reminders
- Task reminders
- Vendor payment reminders
- Accommodation reminders
- Transport reminders
- Invitation delivery
- Image processing
- Analytics aggregation

---

# 21. Wedding Day Mode

Wedding Day Mode should optimize for speed rather than configuration.

```text
                    Wedding Day Mode
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 Current Event        Next Event         Critical Tasks
       │                   │                   │
       ▼                   ▼                   ▼
 Guest Check-in      Vendor Contacts      Open Issues
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                    Emergency Contacts
```

The interface should prioritize mobile usability because coordinators and family members may use phones while moving around the venue.

---

# 22. QR Check-In Architecture

```text
Guest receives invitation
          │
          ▼
Event-specific QR code
          │
          ▼
Scanner
          │
          ▼
Backend QR validation
          │
          ├── Guest exists?        ✓
          ├── Wedding matches?     ✓
          ├── Event matches?       ✓
          └── Event access valid?  ✓
          │
          ▼
Create CheckIn record
          │
          ▼
Update Event Dashboard
```

A guest who is invited to the wedding but not to the current event must not be checked in successfully.

---

# 23. Accommodation Architecture

```text
Wedding
  │
  └── Accommodation
        │
        ├── Hotel
        │    ├── Room 101
        │    ├── Room 102
        │    └── Room 103
        │
        └── Guest Assignments
```

Guest flow:

```text
Guest
  ↓
Needs Accommodation?
  ↓
Hotel Assignment
  ↓
Room Assignment
  ↓
Check-in / Check-out
```

Accommodation can integrate with transport planning.

---

# 24. Transportation Architecture

```text
Transport Plan
      │
      ├── Pickup Location
      ├── Drop Location
      ├── Date / Time
      ├── Vehicle
      ├── Driver
      └── Assigned Guests
```

Example:

```text
Hotel
  ↓
10:00 AM
  ↓
Bus 01
  ↓
Wedding Venue
  ↓
Guests A, B, C, D
```

---

# 25. Vendor and Expense Flow

```text
Vendor
   │
   ├── Contract
   ├── Quoted Amount
   ├── Agreed Amount
   └── Payments
           │
           ▼
        Expenses
           │
           ▼
       Budget Summary
```

Expense lifecycle:

```text
PLANNED
   ↓
RECORDED
   ↓
PARTIALLY_PAID
   ↓
PAID
```

---

# 26. Document Architecture

Documents should be protected by wedding-level and role-level authorization.

```text
Document Request
      │
      ▼
Authentication
      │
      ▼
Wedding Membership
      │
      ▼
Permission Check
      │
      ▼
Generate Signed URL
      │
      ▼
Object Storage
```

Sensitive documents should never be publicly accessible through permanent URLs.

---

# 27. Memories Architecture

```text
Wedding
  │
  └── Albums
        │
        ├── Mehendi
        ├── Sangeet
        ├── Wedding
        └── Reception
              │
              └── Photos
```

Guest uploads should optionally pass through moderation:

```text
UPLOADED
   ↓
PENDING_REVIEW
   ↓
APPROVED / REJECTED
   ↓
VISIBLE
```

---

# 28. Caching Strategy

Caching should be introduced selectively.

Good candidates:

- Public wedding website data
- Public event information
- Frequently requested dashboard summaries
- Permission metadata
- Rate limiting
- Temporary invitation/session information

Avoid caching highly mutable financial or authorization data unless invalidation is carefully designed.

Redis can be added without changing the core architecture.

---

# 29. Search, Filtering and Pagination

Large collections should never be loaded completely into the browser.

Examples:

```text
Guests
Expenses
Vendors
Tasks
Documents
Photos
```

Use server-side pagination:

```http
GET /api/v1/weddings/:weddingId/guests?page=1&limit=25&search=rahul
```

Filtering examples:

```text
Guests:
- Event
- RSVP status
- Invitation status
- Household

Expenses:
- Category
- Event
- Vendor
- Payment status
- Date range

Tasks:
- Status
- Priority
- Assignee
- Event
- Due date
```

---

# 30. Frontend Architecture

Recommended frontend stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Zustand where client-side global state is genuinely needed

Frontend structure:

```text
frontend/
└── src/
    ├── app/
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   ├── invite/
    │   └── w/
    │
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── forms/
    │   └── data-display/
    │
    ├── features/
    │   ├── auth/
    │   ├── wedding/
    │   ├── events/
    │   ├── guests/
    │   ├── tasks/
    │   ├── expenses/
    │   ├── vendors/
    │   ├── invitations/
    │   ├── rsvp/
    │   ├── accommodation/
    │   ├── transport/
    │   ├── documents/
    │   ├── website/
    │   ├── memories/
    │   └── wedding-day/
    │
    ├── services/
    ├── hooks/
    ├── store/
    ├── types/
    ├── validations/
    └── lib/
```

---

# 31. Frontend Routing

Example application routes:

```text
/login
/register
/forgot-password

/weddings
/weddings/:weddingId/dashboard
/weddings/:weddingId/events
/weddings/:weddingId/guests
/weddings/:weddingId/tasks
/weddings/:weddingId/expenses
/weddings/:weddingId/vendors
/weddings/:weddingId/invitations
/weddings/:weddingId/accommodation
/weddings/:weddingId/transport
/weddings/:weddingId/documents
/weddings/:weddingId/website
/weddings/:weddingId/memories
/weddings/:weddingId/wedding-day
/weddings/:weddingId/settings

/invite/:token
/w/:slug
```

---

# 32. State Management Strategy

Do not put all application data into a global client store.

Use:

```text
TanStack Query
    ↓
Server state
    ├── Weddings
    ├── Events
    ├── Guests
    ├── Tasks
    ├── Expenses
    └── Vendors
```

Use Zustand only for genuine client state such as:

```text
- Sidebar state
- Temporary filters
- UI preferences
- Multi-step wizard state
- Local dashboard interaction state
```

Forms should use React Hook Form + Zod.

---

# 33. Security Architecture

## Authentication

Use secure authentication with short-lived access credentials and refresh/session management.

## Passwords

Passwords must be hashed using Argon2id or bcrypt. Never store plaintext passwords.

## Authorization

All protected APIs must validate:

```text
User
 ↓
Wedding
 ↓
Role / Permission
 ↓
Resource
 ↓
Event access if applicable
```

## API Security

- HTTPS everywhere
- CORS allowlist
- Secure HTTP headers
- Rate limiting
- Request validation
- Output sanitization where needed
- Parameterized database queries through Prisma
- Audit logging
- Secure cookies/session handling where applicable

## File Security

- MIME type validation
- File size limits
- Extension validation
- Malware scanning where appropriate
- Private storage by default
- Signed URLs
- Authorization before generating URLs

---

# 34. Audit Logging

Important administrative operations should create audit records.

```text
audit_logs
----------
id
wedding_id
user_id
action
resource_type
resource_id
metadata
ip_address
created_at
```

Examples:

```text
GUEST_ADDED
EVENT_CREATED
EVENT_GUEST_ASSIGNED
ROLE_CHANGED
EXPENSE_CREATED
EXPENSE_UPDATED
DOCUMENT_UPLOADED
DOCUMENT_DELETED
INVITATION_SENT
RSVP_UPDATED
CHECKIN_CREATED
```

---

# 35. Error Handling

Use centralized error handling.

```text
Controller
   ↓
Service throws typed error
   ↓
Global Error Middleware
   ↓
Structured API response
   ↓
Frontend error handler
```

Error categories:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
BUSINESS_RULE_VIOLATION
INTERNAL_SERVER_ERROR
```

Never expose stack traces or internal implementation details in production API responses.

---

# 36. Observability

Production observability should include:

```text
Application Logs
       │
       ├── Request ID
       ├── User ID where appropriate
       ├── Wedding ID where appropriate
       ├── Error code
       └── Execution time

Metrics
       ├── API latency
       ├── Error rate
       ├── Database latency
       ├── Queue failures
       └── Background job duration

Monitoring
       ├── Availability
       ├── Database health
       └── Storage health
```

Avoid logging passwords, tokens, invitation secrets, or sensitive document contents.

---

# 37. Performance Architecture

Key strategies:

- Server-side pagination
- Database indexes
- Efficient Prisma queries
- Avoid N+1 queries
- Select only required fields
- Lazy-load heavy UI modules
- Image optimization
- CDN for public assets
- Object storage for media
- Background processing for heavy operations
- Cache carefully selected read-heavy data

Important database indexes:

```text
weddings.owner_id
wedding_members.wedding_id
wedding_members.user_id
events.wedding_id
events.event_date
guests.wedding_id
event_guests.event_id
event_guests.guest_id
tasks.wedding_id
tasks.event_id
tasks.status
expenses.wedding_id
expenses.event_id
expenses.vendor_id
invitations.token_hash
rsvps.event_guest_id
documents.wedding_id
photos.wedding_id
photos.event_id
```

---

# 38. Transaction Boundaries

Use database transactions for operations that must succeed or fail together.

Example: assigning a guest to an event and creating related invitation state.

```text
BEGIN TRANSACTION
    │
    ├── Validate wedding
    ├── Validate guest
    ├── Validate event
    ├── Create EventGuest
    └── Create invitation state
COMMIT
```

If one operation fails:

```text
ROLLBACK
```

Other examples:

- Vendor payment + payment record update
- Room assignment + accommodation status
- Event deletion/archive with dependent state changes

---

# 39. Domain Events

The modular monolith can use an internal event bus to reduce coupling.

Example:

```text
RSVP_SUBMITTED
      │
      ├── Update RSVP metrics
      ├── Notify couple
      └── Update accommodation requirement
```

Another example:

```text
EVENT_CREATED
      │
      ├── Dashboard updates
      ├── Website projection updates
      └── Optional notification scheduling
```

These are internal application events, not necessarily distributed microservice events.

---

# 40. Testing Architecture

## Unit Tests

Test:

- Business rules
- Permission checks
- Budget calculations
- RSVP rules
- Guest event-access rules
- Task state transitions

## Integration Tests

Test:

- API + database
- Authentication
- Authorization
- EventGuest access
- RSVP flow
- Expense flow
- Invitation flow

## End-to-End Tests

Use Playwright for critical journeys:

```text
Register
  ↓
Create Wedding
  ↓
Create Events
  ↓
Add Guest
  ↓
Assign Guest to Event
  ↓
Generate Invitation
  ↓
Guest RSVP
  ↓
Dashboard Update
```

Also test:

```text
Unauthorized guest → denied
Wrong event guest → denied
Admin → allowed
Owner → allowed
```

---

# 41. CI/CD Architecture

```text
Developer
    │
    ▼
Git Push / Pull Request
    │
    ▼
GitHub Actions
    │
    ├── Install
    ├── Lint
    ├── Type Check
    ├── Unit Tests
    ├── Integration Tests
    ├── Build
    └── Security Checks
    │
    ▼
Docker Image
    │
    ▼
Deployment
```

Recommended environments:

```text
Development
     ↓
Staging
     ↓
Production
```

Database migrations should be version-controlled through Prisma migrations.

---

# 42. Deployment Architecture

## MVP Deployment

```text
                       Internet
                          │
                          ▼
                     Cloudflare
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
          Next.js App         Express API
                                  │
                         ┌────────┼────────┐
                         ▼        ▼        ▼
                    PostgreSQL Object   Optional
                              Storage    Redis
```

## Production Growth

```text
                        Internet
                           │
                           ▼
                      Cloudflare
                           │
                           ▼
                     Load Balancer
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        Frontend Instances        API Instances
                                        │
                     ┌──────────────────┼──────────────────┐
                     ▼                  ▼                  ▼
                PostgreSQL          Redis             Object Storage
                                        │
                                        ▼
                                   BullMQ Workers
```

The modular monolith can be horizontally scaled by running multiple API instances as long as application state is not stored only in process memory.

---

# 43. Scalability Strategy

## Stage 1 - MVP

```text
1 Frontend
1 API
1 PostgreSQL
Object Storage
```

## Stage 2 - Growing Usage

```text
Multiple API instances
Managed PostgreSQL
Redis
Background Workers
CDN
```

## Stage 3 - High Scale

Only extract modules that have a genuine scaling or ownership reason.

Potential candidates:

```text
Notification Service
Media Processing Service
Analytics Service
Public Website Delivery Service
```

Do not split the system into microservices merely because there are many modules.

---

# 44. Disaster Recovery

Required backups:

```text
PostgreSQL
   └── Automated backups

Object Storage
   └── Versioning / backup policy

Application
   └── Immutable container images

Configuration
   └── Environment/configuration management
```

Recovery priorities:

1. PostgreSQL
2. Object storage metadata/content
3. Application deployment
4. Background jobs

The product should define Recovery Point Objective (RPO) and Recovery Time Objective (RTO) before production launch.

---

# 45. Data Lifecycle

Wedding data may remain useful long after the wedding.

```text
Planning
   ↓
Active Wedding
   ↓
Wedding Day
   ↓
Post-Wedding
   ↓
Memories / Archive
```

Do not automatically delete completed wedding data.

Instead use lifecycle states:

```text
DRAFT
ACTIVE
COMPLETED
ARCHIVED
```

Archive behavior should be defined separately from deletion.

---

# 46. Key End-to-End Architecture Flows

## Guest Invitation Flow

```text
Couple
  ↓
Create Guest
  ↓
Assign Event
  ↓
EventGuest Created
  ↓
Generate Invitation
  ↓
Send Invitation
  ↓
Guest Opens Link
  ↓
Validate Token
  ↓
Show Authorized Events
  ↓
Guest RSVPs
  ↓
RSVP Stored
  ↓
Dashboard Updated
```

## Expense Flow

```text
Couple/Admin
    ↓
Create Expense
    ↓
Validate Wedding Access
    ↓
Validate Event/Vendor
    ↓
Save Expense
    ↓
Update Budget Summary
    ↓
Dashboard Refresh
```

## Wedding Day Check-In Flow

```text
Guest
  ↓
QR Code
  ↓
Scanner
  ↓
API
  ↓
Authenticate Scanner User
  ↓
Validate Wedding
  ↓
Validate Event
  ↓
Validate EventGuest
  ↓
Create Check-In
  ↓
Update Attendance
```

## Wedding Website Flow

```text
Wedding Data
     ↓
Website Configuration
     ↓
Publish
     ↓
Public Route
     ↓
Read Published Data
     ↓
Guest / Visitor
```

---

# 47. Recommended Backend Project Structure

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── storage.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── authorization.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── request-id.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── wedding/
│   │   ├── members/
│   │   ├── events/
│   │   ├── guests/
│   │   ├── tasks/
│   │   ├── vendors/
│   │   ├── expenses/
│   │   ├── invitations/
│   │   ├── rsvp/
│   │   ├── accommodation/
│   │   ├── transport/
│   │   ├── documents/
│   │   ├── website/
│   │   ├── notifications/
│   │   ├── wedding-day/
│   │   ├── memories/
│   │   ├── issues/
│   │   └── analytics/
│   │
│   ├── events/
│   │   ├── event-bus.ts
│   │   └── handlers/
│   │
│   ├── jobs/
│   │   ├── queues.ts
│   │   └── workers/
│   │
│   ├── integrations/
│   │   ├── email/
│   │   ├── sms/
│   │   ├── whatsapp/
│   │   ├── maps/
│   │   └── streaming/
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   │
│   └── tests/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

# 48. Recommended Frontend Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── invite/
│   │   └── w/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── common/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── wedding/
│   │   ├── events/
│   │   ├── guests/
│   │   ├── tasks/
│   │   ├── vendors/
│   │   ├── expenses/
│   │   ├── invitations/
│   │   ├── rsvp/
│   │   ├── accommodation/
│   │   ├── transport/
│   │   ├── documents/
│   │   ├── website/
│   │   ├── memories/
│   │   └── wedding-day/
│   │
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── types/
│   ├── validations/
│   └── lib/
│
├── public/
├── Dockerfile
└── package.json
```

---

# 49. Recommended MVP Build Order

The implementation should follow dependency order rather than feature popularity.

```text
Phase 1
Authentication
     ↓
Wedding Creation
     ↓
Wedding Members + RBAC

Phase 2
Events
     ↓
Guests
     ↓
EventGuest Access

Phase 3
Dashboard
     ↓
Tasks
     ↓
Vendors
     ↓
Expenses

Phase 4
Invitations
     ↓
RSVP
     ↓
Notifications

Phase 5
Accommodation
     ↓
Transport
     ↓
Documents

Phase 6
Wedding Website
     ↓
Wedding Day Mode
     ↓
QR Check-In
     ↓
Memories
```

---

# 50. Architecture Decision Records

## ADR-001: Modular Monolith

**Decision:** Use a modular monolith for the initial product.

**Reason:** The domains are strongly related and the team benefits from simple deployment and transactions. Module boundaries preserve future extraction options.

## ADR-002: PostgreSQL

**Decision:** Use PostgreSQL rather than MongoDB for core transactional data.

**Reason:** The product has many relationships and constraints: events, event guests, RSVPs, vendors, expenses, accommodation, transportation and permissions.

## ADR-003: EventGuest as a First-Class Relationship

**Decision:** Model event-level guest access using `event_guests`.

**Reason:** The same guest can attend some wedding events and not others. RSVP and check-in are also event-specific.

## ADR-004: Object Storage for Files

**Decision:** Store media/documents in object storage and metadata in PostgreSQL.

**Reason:** Photos, videos, receipts and documents can become large and should not be stored as database blobs.

## ADR-005: REST API

**Decision:** Use REST for the initial API.

**Reason:** The domain maps naturally to resources, it is straightforward to document and test, and it keeps the initial architecture simple.

## ADR-006: Async Notifications

**Decision:** Use background jobs for scheduled and non-critical notification work.

**Reason:** Notification delivery should not block core wedding operations.

## ADR-007: AI Is Not a Core Dependency

**Decision:** Keep AI features outside the critical path.

**Reason:** Core wedding management must remain deterministic and usable even when AI services are unavailable.

---

# 51. Future AI Extension Point

The architecture should leave room for AI without making the core system dependent on it.

```text
Core Product
     │
     ├── Wedding Data
     ├── Events
     ├── Tasks
     ├── Expenses
     └── Guests
             │
             ▼
        AI Assistant
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
    Planning Budget Timeline
```

Potential future capabilities:

- Generate task plans
- Suggest wedding timelines
- Summarize wedding status
- Identify overdue tasks
- Explain budget trends
- Draft guest communication
- Recommend reminder schedules

AI should operate through controlled APIs and permissions and should never bypass existing authorization rules.

---

# 52. Final Architecture

```text
                              MY MARRIAGE
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
          Next.js Web App                    Public Wedding Web
        React + TypeScript                       Pages
                 │                                 │
                 └────────────────┬────────────────┘
                                  │
                                  ▼
                         Node.js + Express
                         Modular Monolith
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       │                          │                          │
       ▼                          ▼                          ▼
  Core Domains              Operations Domains         Experience Domains
       │                          │                          │
       ├── Auth                   ├── Tasks                  ├── Website
       ├── Wedding                ├── Vendors                ├── Invitations
       ├── Members                ├── Expenses               ├── RSVP
       ├── Events                 ├── Accommodation          ├── Memories
       └── Guests                 ├── Transport              └── Live Stream
                                  ├── Documents
                                  ├── Wedding Day
                                  └── Issues
                                  │
                                  ▼
                             PostgreSQL
                                  │
                  ┌───────────────┼───────────────┐
                  ▼               ▼               ▼
             Object Storage     Redis          External APIs
                              (optional)       Email / Maps /
                                               SMS / WhatsApp /
                                               Streaming
```

---

# 53. Final Architecture Summary

| Concern | Decision |
|---|---|
| Architecture | Modular Monolith |
| Frontend | Next.js + React + TypeScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| API | REST /api/v1 |
| Authentication | Secure session/token-based authentication |
| Authorization | RBAC + resource-level + event-level authorization |
| Multi-tenancy | Logical tenant isolation using wedding_id |
| Guest Access | Wedding → Event → EventGuest → Guest |
| Server State | TanStack Query |
| Client State | Zustand where required |
| Validation | Zod |
| Files | S3-compatible Object Storage |
| Background Jobs | BullMQ + Redis when needed |
| Notifications | Email first; SMS/WhatsApp later |
| Website | Data-driven public/private wedding pages |
| Streaming | Third-party provider |
| Testing | Jest + Supertest + Playwright |
| CI/CD | GitHub Actions |
| Deployment | Docker |
| Scaling | Horizontal API scaling before service extraction |
| Future Services | Notifications, media, analytics, website delivery if justified |
| AI | Optional extension, never a core dependency |

---

# 54. Most Important Architectural Decision

The core of My Marriage is not simply the wedding dashboard. It is the relationship between **Wedding, Event, Guest, and EventGuest**.

```text
                         Wedding
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Events          Guests        Members
             │              │
             └──────┬───────┘
                    ▼
               EventGuest
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
         RSVP     Check-In  Invitation
          │
          ▼
 Accommodation / Transport
```

This model enables the platform to support the complexity of Indian weddings while keeping authorization, invitations, RSVPs, accommodation, transport, check-in, and wedding-day execution connected to the same source of truth.

The architectural goal is therefore:

> **One wedding system of record, with strong event-level access control and modular business domains.**
