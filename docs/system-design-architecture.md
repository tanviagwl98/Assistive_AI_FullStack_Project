# MY MARRIAGE

## System Design & Architecture Document

**Product:** My Marriage
**Architecture:** Modular Monolith
**Frontend:** Next.js / React / TypeScript
**Backend:** Node.js / Express.js / TypeScript
**Database:** MongoDB
**ODM:** Mongoose
**Storage:** S3-compatible Object Storage
**API Style:** REST
**Deployment:** Docker + GitHub Actions

---

# 1. Architecture Overview

My Marriage is designed as a **modular monolith**: one deployable backend application containing clearly separated business modules.

The architecture is intentionally not microservices-first. The product has many strongly connected domains such as weddings, events, guests, invitations, RSVPs, vendors, expenses, accommodation, transportation, documents, and wedding-day execution.

Keeping these domains inside one application simplifies development, testing, deployment, local development, and operational complexity while preserving clear module boundaries for future extraction if scale requires it.

MongoDB is used as the primary database because the application contains a combination of structured relationships, flexible wedding-specific data, event configurations, guest information, media metadata, and evolving feature requirements. Mongoose provides schema definitions, validation, middleware, indexes, references, and a structured data-access layer on top of MongoDB.

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
             │   MongoDB    │     │ Object       │     │ Redis        │
             │ Atlas / DB   │     │ Storage      │     │ Optional     │
             │ + Mongoose   │     │ S3-compatible│    │              │
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

The backend is one application but is divided into business modules.

```text
modules/
├── auth/
├── wedding/
├── members/
├── events/
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

Modules communicate through application services and internal domain events rather than directly accessing another module's internal implementation.

---

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

Every wedding-owned MongoDB document should contain a `weddingId` wherever practical.

This makes tenant isolation explicit at the data-access layer.

---

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

---

## 2.4 Backend as the Source of Truth

Frontend permission checks improve UX but do not provide security.

Every protected operation must be authorized by the backend.

---

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

# 3. MongoDB Data Modeling Strategy

My Marriage uses a **hybrid MongoDB data-modeling strategy**.

The application should not attempt to put the entire wedding into one MongoDB document.

Instead:

### Embed

Embed small, tightly coupled data that is normally retrieved together.

Examples:

```text
Wedding
 ├── privacySettings
 ├── notificationSettings
 ├── websiteSettings
 └── primaryAddress
```

### Reference

Reference entities that:

* Grow independently.
* Are frequently updated.
* Are shared across multiple features.
* Can become large.
* Need independent querying.

Examples:

```text
Wedding
 ├── Events
 ├── Guests
 ├── Vendors
 ├── Tasks
 ├── Expenses
 ├── Documents
 └── Photos
```

### Core principle

```text
Small + tightly coupled
        ↓
     Embed

Large + independent
        ↓
    Reference
```

---

# 4. C4-Style System Context

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
    ├── S3-compatible Object Storage
    └── Optional OAuth Provider
```

---

# 5. Application Layer Architecture

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
│ Application   │  Use cases
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
│ Mongoose      │
│ Models        │
└───────┬───────┘
        ▼
┌───────────────┐
│ MongoDB       │
└───────────────┘
```

External services should be accessed through adapters/interfaces rather than being embedded directly inside business logic.

---

# 6. Backend Module Boundaries

## 6.1 Auth Module

Responsibilities:

* Registration
* Login
* Logout
* Password reset
* Session/token management
* Optional Google OAuth
* User profile

Wedding permissions are handled by the members/authorization layer.

---

## 6.2 Wedding Module

Responsibilities:

* Create wedding
* Update wedding information
* Wedding settings
* Wedding privacy
* Wedding lifecycle
* Budget configuration

Owns the root `Wedding` document.

---

## 6.3 Members & Authorization Module

Responsibilities:

* Add/remove wedding members
* Assign roles
* Permission management
* Wedding-level authorization
* Event-level authorization helpers

Example roles:

```text
OWNER
ADMIN
FAMILY_MEMBER
EVENT_MANAGER
VENDOR
GUEST
```

---

## 6.4 Events Module

Responsibilities:

* Create/update/archive events
* Event scheduling
* Event venue
* Event metadata
* Event ordering
* Event calendar/timeline

---

## 6.5 Guests Module

Responsibilities:

* Guest directory
* Contact information
* Household/family grouping
* Guest notes
* Plus-one information
* Guest status

---

## 6.6 EventGuest Module

Responsibilities:

* Event invitation assignment
* Event-level authorization
* Event RSVP relationship
* Event check-in relationship
* Event invitation state

This is a critical module.

---

## 6.7 Tasks Module

Responsibilities:

* Tasks
* Assignment
* Priority
* Due dates
* Kanban state
* Attachments
* Task reminders

---

## 6.8 Vendors Module

Responsibilities:

* Vendor profiles
* Event-vendor relationships
* Contracts
* Quoted/agreed amounts
* Vendor payments
* Vendor notes

---

## 6.9 Expenses Module

Responsibilities:

* Budget
* Expenses
* Categories
* Payments
* Receipts
* Pending amounts
* Budget calculations

---

## 6.10 Invitations Module

Responsibilities:

* Invitation templates
* Invitation generation
* Unique links
* Invitation delivery status
* Invitation/event mapping

---

## 6.11 RSVP Module

Responsibilities:

* Event-specific RSVP
* Attendee count
* Meal preferences
* Accommodation requirement
* Transport requirement
* RSVP statistics

---

## 6.12 Accommodation Module

Responsibilities:

* Hotels
* Rooms
* Guest assignments
* Check-in/out
* Accommodation payments

---

## 6.13 Transport Module

Responsibilities:

* Vehicles
* Drivers
* Pickup points
* Drop points
* Schedules
* Guest assignments

---

## 6.14 Documents Module

Responsibilities:

* Contracts
* Receipts
* Invoices
* Marriage-related documents
* Travel/accommodation documents
* Registration checklist
* Role-based access

---

## 6.15 Website Module

Responsibilities:

* Wedding website configuration
* Public/private settings
* Published content
* Theme/template configuration
* Data projection from wedding/event documents

---

## 6.16 Notifications Module

Responsibilities:

* Notification preferences
* Notification templates
* In-app notifications
* Email notifications
* Future SMS/WhatsApp adapters
* Reminder scheduling

---

## 6.17 Wedding Day Module

Responsibilities:

* Current event
* Event timeline
* Critical tasks
* Vendor contacts
* Emergency contacts
* Wedding-day operational dashboard

---

## 6.18 Check-In Module

Responsibilities:

* QR validation
* Event access validation
* Guest check-in
* Check-in timestamps
* Event attendance metrics

---

## 6.19 Memories Module

Responsibilities:

* Albums
* Photos
* Guest uploads
* Moderation
* Event tagging
* Download/share permissions

---

## 6.20 Issues Module

Responsibilities:

* Wedding-day issues
* Priority
* Assignment
* Status
* Attachments
* Resolution tracking

---

## 6.21 Analytics Module

Responsibilities:

* Wedding metrics
* RSVP metrics
* Guest check-in metrics
* Task completion
* Expense summary
* Vendor summary
* Accommodation/transport summary

Analytics should primarily read data from other modules rather than owning operational data.

---

# 7. MongoDB Collection Architecture

Core collections:

```text
users
weddings
weddingMembers
roles
permissions

events
guests
eventGuests

tasks
vendors
eventVendors

expenses
payments

invitations
rsvps
reminders
notifications

venues
accommodations
rooms
roomAssignments

transports
vehicles
drivers
transportAssignments

documents

websites
albums
photos
liveStreams
issues

auditLogs
checkIns
```

MongoDB uses collections rather than relational tables.

---

# 8. Core Domain Relationship Model

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
 │                                                   ├──< CheckIn
 │                                                   │
 │                                                   └──< Issue
```

These are logical relationships. MongoDB stores the entities in separate collections where independent querying and growth justify references.

---

# 9. Core MongoDB Schemas

## 9.1 User

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone?: string,
  passwordHash: string,
  profileImageUrl?: string,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

```text
email: unique
```

---

## 9.2 Wedding

```typescript
{
  _id: ObjectId,

  ownerId: ObjectId,

  name: string,

  couple: {
    name1: string,
    name2: string
  },

  weddingDate?: Date,

  location?: {
    city?: string,
    state?: string,
    country?: string,
    address?: string,
    latitude?: number,
    longitude?: number
  },

  budget?: {
    total: number,
    currency: string
  },

  privacy: {
    isPublic: boolean
  },

  settings: {
    timezone: string,
    defaultReminderSchedule?: number[]
  },

  websiteSettings?: {
    slug?: string,
    published: boolean,
    theme?: string
  },

  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED",

  createdAt: Date,
  updatedAt: Date
}
```

---

# 10. Wedding Member Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,
  userId: ObjectId,

  roleId: ObjectId,

  permissions?: string[],

  status: "INVITED" | "ACTIVE" | "SUSPENDED",

  createdAt: Date,
  updatedAt: Date
}
```

Unique index:

```text
{ weddingId: 1, userId: 1 }
```

---

# 11. Event Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  name: string,
  description?: string,

  date: Date,

  startTime?: string,
  endTime?: string,

  venueId?: ObjectId,

  venue?: {
    name?: string,
    address?: string,
    mapUrl?: string
  },

  dressCode?: string,
  notes?: string,

  sortOrder: number,

  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED",

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

```text
{ weddingId: 1, date: 1 }
{ weddingId: 1, sortOrder: 1 }
```

---

# 12. Guest Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  householdId?: ObjectId,

  name: string,
  email?: string,
  phone?: string,

  relationship?: string,

  address?: {
    line1?: string,
    line2?: string,
    city?: string,
    state?: string,
    postalCode?: string,
    country?: string
  },

  plusOneAllowed: boolean,

  notes?: string,

  status: "ACTIVE" | "ARCHIVED",

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

```text
{ weddingId: 1, name: 1 }
{ weddingId: 1, phone: 1 }
{ weddingId: 1, email: 1 }
```

---

# 13. EventGuest Schema

This is one of the most important MongoDB collections.

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,
  eventId: ObjectId,
  guestId: ObjectId,

  invitationStatus:
    "NOT_SENT" |
    "SENT" |
    "OPENED" |
    "RESPONDED",

  rsvpStatus:
    "PENDING" |
    "ACCEPTED" |
    "DECLINED",

  attendeeCount: number,

  accommodationRequired: boolean,
  transportRequired: boolean,

  checkInStatus:
    "NOT_CHECKED_IN" |
    "CHECKED_IN",

  checkInAt?: Date,

  notes?: string,

  createdAt: Date,
  updatedAt: Date
}
```

Unique index:

```text
{ eventId: 1, guestId: 1 }
```

Additional index:

```text
{ weddingId: 1, eventId: 1 }
```

---

# 14. Task Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,
  eventId?: ObjectId,

  title: string,
  description?: string,

  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",

  status:
    "TODO" |
    "IN_PROGRESS" |
    "BLOCKED" |
    "COMPLETED",

  assigneeIds: ObjectId[],

  dueDate?: Date,

  attachments?: [
    {
      storageKey: string,
      fileName: string
    }
  ],

  createdBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

```text
{ weddingId: 1, status: 1 }
{ weddingId: 1, dueDate: 1 }
{ weddingId: 1, eventId: 1 }
```

---

# 15. Vendor Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  name: string,
  category: string,

  contact?: {
    phone?: string,
    email?: string,
    address?: string
  },

  financials?: {
    quotedAmount?: number,
    agreedAmount?: number,
    paidAmount?: number,
    pendingAmount?: number
  },

  contract?: {
    storageKey?: string,
    fileName?: string
  },

  notes?: string,

  status: "ACTIVE" | "COMPLETED" | "CANCELLED",

  createdAt: Date,
  updatedAt: Date
}
```

---

# 16. EventVendor Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,
  eventId: ObjectId,
  vendorId: ObjectId,

  notes?: string,

  createdAt: Date
}
```

Unique index:

```text
{ eventId: 1, vendorId: 1 }
```

---

# 17. Expense Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  eventId?: ObjectId,
  vendorId?: ObjectId,

  category: string,

  title: string,

  amount: number,
  paidAmount: number,

  paymentStatus:
    "PENDING" |
    "PARTIALLY_PAID" |
    "PAID",

  paymentMethod?:
    "CASH" |
    "UPI" |
    "CARD" |
    "BANK_TRANSFER" |
    "OTHER",

  expenseDate?: Date,

  receipt?: {
    storageKey?: string,
    fileName?: string
  },

  notes?: string,

  createdBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

```text
{ weddingId: 1, expenseDate: -1 }
{ weddingId: 1, paymentStatus: 1 }
{ weddingId: 1, eventId: 1 }
{ weddingId: 1, vendorId: 1 }
```

---

# 18. Invitation Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  guestId: ObjectId,

  eventIds: ObjectId[],

  tokenHash: string,

  status:
    "DRAFT" |
    "SENT" |
    "OPENED" |
    "RESPONDED",

  sentAt?: Date,
  openedAt?: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Index:

```text
tokenHash: unique
```

The raw invitation token should not be stored directly where avoidable. Store a secure hash and resolve the incoming token server-side.

---

# 19. RSVP Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  eventGuestId: ObjectId,

  response:
    "ACCEPTED" |
    "DECLINED" |
    "PENDING",

  attendeeCount: number,

  accommodationRequired: boolean,
  transportRequired: boolean,

  mealPreference?: string,

  submittedAt?: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Unique index:

```text
eventGuestId: unique
```

---

# 20. Document Schema

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  eventId?: ObjectId,

  uploadedBy: ObjectId,

  category:
    "CONTRACT" |
    "INVOICE" |
    "RECEIPT" |
    "TRAVEL" |
    "MARRIAGE_DOCUMENT" |
    "OTHER",

  fileName: string,
  storageKey: string,

  mimeType: string,
  fileSize: number,

  visibility:
    "PRIVATE" |
    "MEMBERS" |
    "EVENT_MEMBERS",

  createdAt: Date,
  updatedAt: Date
}
```

Actual files are stored in S3-compatible object storage.

MongoDB stores metadata and storage references.

---

# 21. Photo and Album Schemas

## Album

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,
  eventId?: ObjectId,

  name: string,

  visibility:
    "PRIVATE" |
    "MEMBERS" |
    "PUBLIC",

  createdBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Photo

```typescript
{
  _id: ObjectId,

  weddingId: ObjectId,

  eventId?: ObjectId,
  albumId?: ObjectId,

  uploadedBy: ObjectId,

  storageKey: string,

  mimeType: string,
  fileSize: number,

  moderationStatus:
    "PENDING" |
    "APPROVED" |
    "REJECTED",

  createdAt: Date,
  updatedAt: Date
}
```

---

# 22. MongoDB Indexing Strategy

Indexes should be designed around actual application queries.

Important indexes include:

```text
users
 └── email

weddings
 └── ownerId

weddingMembers
 ├── { weddingId, userId } UNIQUE
 └── { userId, status }

events
 ├── { weddingId, date }
 └── { weddingId, sortOrder }

guests
 ├── { weddingId, name }
 ├── { weddingId, phone }
 └── { weddingId, email }

eventGuests
 ├── { eventId, guestId } UNIQUE
 ├── { weddingId, eventId }
 └── { weddingId, guestId }

tasks
 ├── { weddingId, status }
 ├── { weddingId, dueDate }
 └── { weddingId, eventId }

vendors
 └── { weddingId, category }

eventVendors
 └── { eventId, vendorId } UNIQUE

expenses
 ├── { weddingId, expenseDate }
 ├── { weddingId, paymentStatus }
 ├── { weddingId, eventId }
 └── { weddingId, vendorId }

invitations
 └── tokenHash UNIQUE

rsvps
 └── eventGuestId UNIQUE

documents
 ├── { weddingId, category }
 └── { weddingId, eventId }

photos
 ├── { weddingId, albumId }
 └── { weddingId, eventId }

auditLogs
 ├── { weddingId, createdAt }
 └── { weddingId, userId }
```

Indexes should be reviewed as the application's query patterns evolve.

---

# 23. MongoDB Multi-Tenancy Strategy

My Marriage uses **logical multi-tenancy**.

Every wedding-owned collection should contain `weddingId`.

Example:

```typescript
{
  weddingId: weddingId,
  status: "ACTIVE"
}
```

Queries should always include the tenant boundary.

Example:

```typescript
Guest.find({
  weddingId,
  status: "ACTIVE"
});
```

Never perform a tenant-owned query using only:

```typescript
Guest.findById(guestId);
```

without subsequently validating that the guest belongs to the authorized wedding.

A safer repository method is:

```typescript
Guest.findOne({
  _id: guestId,
  weddingId
});
```

This makes cross-wedding data access significantly harder to introduce accidentally.

---

# 24. Authorization Architecture

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
GET /api/v1/events/:eventId
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

# 25. RBAC + Resource Authorization

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
 └── Explicitly assigned permissions

EVENT_MANAGER
 └── Event-specific permissions

VENDOR
 └── Vendor-specific access

GUEST
 └── Guest/event-specific read + RSVP permissions
```

---

# 26. API Architecture

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

# 27. API Response Standard

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

MongoDB queries should use `skip/limit` initially where appropriate, with cursor-based pagination considered for very large collections or high-volume feeds.

---

# 28. Dashboard Architecture

The dashboard is an aggregation layer rather than a separate database.

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
                         MongoDB Aggregation
                                  │
                                  ▼
                            Dashboard DTO
                                  │
                                  ▼
                               Frontend
```

MongoDB aggregation pipelines can calculate:

* Guest totals
* RSVP counts
* Expense totals
* Task completion
* Upcoming events
* Vendor counts
* Check-in statistics

---

# 29. Invitation and RSVP Flow

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

Invitation tokens should be securely generated and stored as hashes where possible.

---

# 30. Wedding Website Architecture

The wedding website should be a read-oriented projection of existing wedding data.

```text
MongoDB
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

Publishing should support:

```text
DRAFT → PREVIEW → PUBLISHED → UNPUBLISHED
```

---

# 31. File and Media Architecture

Binary files should not be stored directly inside MongoDB for the core implementation.

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
S3-compatible Object Storage
   │
   ▼
Metadata stored in MongoDB
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

# 32. Notification Architecture

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

Potential domain events:

```text
RSVP_SUBMITTED
RSVP_REMINDER_DUE
TASK_DUE_SOON
VENDOR_PAYMENT_DUE
EVENT_UPCOMING
ACCOMMODATION_CHECKIN_SOON
TRANSPORT_DEPARTURE_SOON
```

For the MVP, email and in-app notifications can be implemented first.

Redis + BullMQ can be introduced for scheduled jobs and asynchronous workloads.

---

# 33. Background Job Architecture

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

* RSVP reminders
* Event reminders
* Task reminders
* Vendor payment reminders
* Accommodation reminders
* Transport reminders
* Invitation delivery
* Image processing
* Analytics aggregation

Redis is an infrastructure dependency only when asynchronous/background processing is enabled.

---

# 34. Wedding Day Mode

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

The interface should prioritize mobile usability.

---

# 35. QR Check-In Architecture

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

A guest invited to the wedding but not to the current event must not be checked in successfully.

---

# 36. Accommodation Architecture

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

---

# 37. Transportation Architecture

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

---

# 38. Vendor and Expense Flow

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

# 39. Document Architecture

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

# 40. Memories Architecture

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

Guest uploads can optionally pass through moderation:

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

# 41. Caching Strategy

Caching should be introduced selectively.

Good candidates:

* Public wedding website data
* Public event information
* Frequently requested dashboard summaries
* Permission metadata
* Rate limiting
* Temporary invitation/session information

Avoid caching highly mutable financial or authorization data unless invalidation is carefully designed.

Redis can be added without changing the core MongoDB architecture.

---

# 42. Search, Filtering and Pagination

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

MongoDB indexes should support the most common search/filter combinations.

For example:

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

MongoDB Atlas Search can be considered later if full-text search becomes a requirement.

---

# 43. Frontend Architecture

Recommended frontend stack:

* Next.js
* React
* TypeScript
* Tailwind CSS
* TanStack Query
* React Hook Form
* Zod
* Zustand where client-side global state is genuinely needed

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

# 44. Frontend Routing

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

# 45. State Management Strategy

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

# 46. Security Architecture

## Authentication

Use secure authentication with short-lived access credentials and refresh/session management.

## Passwords

Passwords must be hashed using Argon2id or bcrypt.

Never store plaintext passwords.

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

* HTTPS everywhere
* CORS allowlist
* Secure HTTP headers
* Rate limiting
* Request validation
* Output sanitization where needed
* Mongoose query safety
* Audit logging
* Secure cookies/session handling where applicable

## File Security

* MIME type validation
* File size limits
* Extension validation
* Malware scanning where appropriate
* Private storage by default
* Signed URLs
* Authorization before generating URLs

---

# 47. Audit Logging

Important administrative operations should create audit records.

```text
auditLogs
----------
_id
weddingId
userId
action
resourceType
resourceId
metadata
ipAddress
createdAt
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

# 48. Error Handling

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

# 49. Observability

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
       ├── MongoDB latency
       ├── Queue failures
       └── Background job duration

Monitoring
       ├── Application availability
       ├── MongoDB health
       └── Storage health
```

Avoid logging passwords, tokens, invitation secrets, or sensitive document contents.

---

# 50. Performance Architecture

Key strategies:

* Server-side pagination
* MongoDB indexes
* Efficient Mongoose queries
* Avoid N+1 queries
* Use `.lean()` for read-only queries where appropriate
* Select only required fields
* Lazy-load heavy UI modules
* Image optimization
* CDN for public assets
* Object storage for media
* Background processing for heavy operations
* Cache carefully selected read-heavy data
* Use MongoDB aggregation pipelines for dashboard calculations

---

# 51. MongoDB Transaction Strategy

MongoDB supports multi-document transactions when an operation genuinely requires atomic updates across collections.

Example:

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

If an operation fails:

```text
ROLLBACK
```

Potential transaction use cases:

* Creating an event and associated configuration.
* Assigning a guest to an event and creating related state.
* Recording a payment and updating payment-related fields.
* Assigning accommodation and updating room occupancy.
* Complex administrative operations involving multiple collections.

Do not use transactions for every operation. Prefer a single atomic document update whenever the data model allows it.

MongoDB transactions require the appropriate deployment configuration, such as a replica set or MongoDB Atlas cluster.

---

# 52. Domain Events

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

These are internal application events, not distributed microservice events.

---

# 53. Testing Architecture

## Unit Tests

Test:

* Business rules
* Permission checks
* Budget calculations
* RSVP rules
* Guest event-access rules
* Task state transitions

## Integration Tests

Test:

* API + MongoDB
* Authentication
* Authorization
* EventGuest access
* RSVP flow
* Expense flow
* Invitation flow

A dedicated test MongoDB instance or ephemeral MongoDB environment should be used for integration testing.

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

# 54. CI/CD Architecture

```text
Developer
    │
    ▼
Git Push / Pull Request
    │
    ▼
GitHub Actions
    │
    ├── Install dependencies
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

MongoDB schema/index changes should be version-controlled through application migration scripts or controlled Mongoose/index-management processes.

Unlike Prisma migrations, MongoDB does not require a relational migration file for every schema change. Changes should be handled through versioned migration scripts when existing production documents require transformation.

---

# 55. Deployment Architecture

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
                     MongoDB   Object    Optional
                     Atlas     Storage   Redis
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
                 MongoDB Atlas       Redis             Object Storage
                                        │
                                        ▼
                                   BullMQ Workers
```

The modular monolith can be horizontally scaled by running multiple API instances as long as application state is not stored only in process memory.

---

# 56. Scalability Strategy

## Stage 1 - MVP

```text
1 Frontend
1 API
1 MongoDB
Object Storage
```

## Stage 2 - Growing Usage

```text
Multiple API instances
Managed MongoDB Atlas
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

# 57. Disaster Recovery

Required backups:

```text
MongoDB Atlas
   └── Automated backups / point-in-time recovery

Object Storage
   └── Versioning / backup policy

Application
   └── Immutable container images

Configuration
   └── Environment/configuration management
```

Recovery priorities:

1. MongoDB data
2. Object storage content
3. Application deployment
4. Background jobs

The product should define Recovery Point Objective (RPO) and Recovery Time Objective (RTO) before production launch.

---

# 58. Data Lifecycle

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

Use lifecycle states:

```text
DRAFT
ACTIVE
COMPLETED
ARCHIVED
```

Archive behavior should be defined separately from deletion.

---

# 59. Key End-to-End Architecture Flows

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
MongoDB Aggregation / Summary
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

# 60. Recommended Backend Project Structure

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── storage.ts
│   │   └── redis.ts
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
│   ├── database/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── indexes/
│   │   └── migrations/
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   │
│   └── tests/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

# 61. Recommended Frontend Project Structure

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

# 62. Recommended MVP Build Order

The implementation should follow dependency order.

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

# 63. Architecture Decision Records

## ADR-001: Modular Monolith

**Decision:** Use a modular monolith for the initial product.

**Reason:** The domains are strongly related and the team benefits from simple deployment and operational complexity. Module boundaries preserve future extraction options.

---

## ADR-002: MongoDB

**Decision:** Use MongoDB as the primary application database.

**Reason:** The application contains a mixture of structured relationships and flexible, evolving wedding-specific data. MongoDB's document model works well for configuration-heavy entities while references can maintain relationships between independently managed entities.

The application will use a hybrid embedding/reference strategy rather than either embedding everything or referencing everything.

---

## ADR-003: Mongoose

**Decision:** Use Mongoose as the ODM.

**Reason:** Mongoose provides schema definitions, validation, middleware, indexes, references, model organization, and a consistent data-access abstraction for the Node.js backend.

---

## ADR-004: EventGuest as a First-Class Relationship

**Decision:** Model event-level guest access using `eventGuests`.

**Reason:** The same guest can attend some wedding events and not others. RSVP and check-in are also event-specific.

---

## ADR-005: Object Storage for Files

**Decision:** Store media/documents in S3-compatible object storage and metadata in MongoDB.

**Reason:** Photos, videos, receipts, and documents can become large and should not be stored directly in MongoDB.

---

## ADR-006: REST API

**Decision:** Use REST for the initial API.

**Reason:** The domain maps naturally to resources, REST is straightforward to document and test, and it keeps the initial architecture simple.

---

## ADR-007: Async Notifications

**Decision:** Use background jobs for scheduled and non-critical notification work.

**Reason:** Notification delivery should not block core wedding operations.

---

## ADR-008: AI Is Not a Core Dependency

**Decision:** Keep AI features outside the critical path.

**Reason:** Core wedding management must remain deterministic and usable even when AI services are unavailable.

---

# 64. Future AI Extension Point

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

* Generate task plans.
* Suggest wedding timelines.
* Summarize wedding status.
* Identify overdue tasks.
* Explain budget trends.
* Draft guest communication.
* Recommend reminder schedules.

AI should operate through controlled APIs and existing authorization rules.

---

# 65. Final Architecture

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
                              MongoDB
                              + Mongoose
                                  │
                  ┌───────────────┼───────────────┐
                  ▼               ▼               ▼
             Object Storage     Redis          External APIs
                              (optional)       Email / Maps /
                                               SMS / WhatsApp /
                                               Streaming
```

---

# 66. Final Architecture Summary

| Concern          | Decision                                                                   |
| ---------------- | -------------------------------------------------------------------------- |
| Architecture     | Modular Monolith                                                           |
| Frontend         | Next.js + React + TypeScript                                               |
| Backend          | Node.js + Express.js + TypeScript                                          |
| Database         | MongoDB                                                                    |
| ODM              | Mongoose                                                                   |
| API              | REST `/api/v1`                                                             |
| Authentication   | Secure session/token-based authentication                                  |
| Authorization    | RBAC + resource-level + event-level authorization                          |
| Multi-tenancy    | Logical tenant isolation using `weddingId`                                 |
| Guest Access     | Wedding → Event → EventGuest → Guest                                       |
| Server State     | TanStack Query                                                             |
| Client State     | Zustand where required                                                     |
| Validation       | Zod                                                                        |
| Files            | S3-compatible Object Storage                                               |
| Background Jobs  | BullMQ + Redis when needed                                                 |
| Notifications    | Email first; SMS/WhatsApp later                                            |
| Website          | Data-driven public/private wedding pages                                   |
| Streaming        | Third-party provider                                                       |
| Testing          | Jest + Supertest + Playwright                                              |
| CI/CD            | GitHub Actions                                                             |
| Deployment       | Docker                                                                     |
| Scaling          | Horizontal API scaling before service extraction                           |
| Database Scaling | MongoDB Atlas scaling, indexes, aggregation, and appropriate schema design |
| Future Services  | Notifications, media, analytics, website delivery if justified             |
| AI               | Optional extension, never a core dependency                                |

---

# 67. Most Important Architectural Decision

The core of My Marriage is not simply the wedding dashboard.

It is the relationship between:

**Wedding → Event → Guest → EventGuest**

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

The architectural goal is:

> **One wedding system of record, with strong event-level access control and modular business domains, powered by MongoDB's document-oriented data model.**
