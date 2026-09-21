MY MARRIAGE
Product Requirements Document (PRD)
Wedding Planning & Management Platform | Initial Product Specification
# 1. Product Overview
Product Name: My Marriage
Product Type: Wedding Planning and Management Platform
Primary Market: Indian weddings
Initial Platform: Responsive web application
Primary Users: Couples, families, wedding coordinators, vendors, and guests
Product Approach: A connected wedding operating system that centralizes planning, guest management, communication, execution, and post-wedding memories.
# 2. Product Vision
My Marriage aims to become a single system of record for a wedding. Instead of managing wedding information across WhatsApp conversations, spreadsheets, documents, calls, emails, and paper, users should be able to manage the complete wedding lifecycle from one platform.
The product should be especially useful for Indian weddings, where one wedding can contain multiple events, different guest groups, multiple families, vendors, payments, accommodation, transportation, and rapidly changing schedules.
# 3. Problem Statement
- Wedding information is scattered across multiple tools and conversations.
- Couples and families struggle to understand what needs to be done, by whom, and by when.
- The same guest may be invited to some events but not others.
- RSVPs, accommodation, transportation, and check-ins need to be event-specific.
- Vendor payments, expenses, contracts, and receipts are difficult to track centrally.
- Last-minute wedding-day changes are difficult to communicate and coordinate.
- Guests often receive information through fragmented messages instead of one reliable source.
- Wedding websites and invitations often require duplicate data entry.
# 4. Product Goals
- Allow a couple to create and configure a complete wedding.
- Support multiple wedding events with independent schedules and guest access.
- Provide role-based access for couples, family members, coordinators, vendors, and guests.
- Centralize tasks, vendors, expenses, payments, and documents.
- Manage digital invitations and event-level RSVPs.
- Provide accommodation and transportation management.
- Generate a wedding website from existing wedding data.
- Provide a wedding-day execution dashboard.
- Support post-wedding memories, photographs, and documents.
- Create a strong foundation for future automation and AI features without making AI a dependency for the core product.
# 5. Non-Goals for the Initial Version
- Building an AI wedding planner as the core product.
- Operating proprietary live-streaming infrastructure.
- Replacing official government marriage-registration portals or legal processes.
- Building a full payment gateway or financial service.
- Replacing WhatsApp or other general-purpose messaging platforms.
- Building a vendor marketplace in the first release.
- Advanced photo/video editing.
- Native mobile applications in the first release.
# 6. User Personas
## 6.1 Couple
The primary product owner. Creates the wedding, manages events, guests, budget, vendors, tasks, invitations, and permissions.
## 6.2 Wedding Admin / Family Member
A trusted person who can manage selected areas of the wedding based on assigned permissions.
## 6.3 Event Manager / Coordinator
Manages specific wedding events, schedules, vendors, tasks, and guest-related operations.
## 6.4 Vendor
A service provider such as a photographer, caterer, decorator, makeup artist, venue, transport provider, or planner. Vendor access should be limited to information relevant to their work.
## 6.5 Guest
Views the events they are invited to, receives invitations and reminders, submits RSVPs, accesses relevant venue and travel information, and can use event-specific check-in and live-stream features.
# 7. Core Product Architecture
The central relationship is Wedding → Events → Event Guests. A guest belongs to the wedding, while access to individual events is controlled through an EventGuest relationship.
- User → Wedding
- Wedding → Wedding Members
- Wedding → Events
- Wedding → Guests
- Event ↔ Guest through EventGuest
- Wedding/Event → Tasks
- Wedding/Event → Vendors
- Wedding/Event → Expenses
- Wedding/Event → Invitations
- Event → RSVP
- Wedding/Event → Accommodation and Transport
- Wedding/Event → Documents, Live Stream, Photos, and Issues
# 8. Functional Requirements
# 8.1 Authentication
- User registration and login.
- Forgot-password and password-reset flow.
- Optional social login such as Google.
- Session management.
- Secure logout.
- User profile management.
# 8.2 Wedding Setup
- Create a wedding.
- Enter couple names and wedding details.
- Set wedding date, city, venue, and basic information.
- Set initial budget.
- Create default events or add custom events.
- Invite family members and administrators.
- Configure wedding privacy and access.
# 8.3 Event Management
- Create, edit, reorder, archive, and view events.
- Set event name, date, start/end time, venue, description, dress code, and notes.
- Associate guests, tasks, vendors, expenses, invitations, RSVP, and live-stream information with an event.
- Display events in timeline and calendar views.
Example events: Engagement, Haldi, Mehendi, Sangeet, Wedding, Reception, and Vidaai.
# 8.4 Event-Level Guest Management
This is a core product requirement.
- Create and maintain a wedding guest directory.
- Assign a guest to one or more events.
- Allow different guest access for different events.
- Track invitation and RSVP status per event.
- Track event-specific check-in.
- Store guest contact details and relevant notes.
- Support household/family grouping where useful.
Example: Guest A may be invited to Sangeet, Wedding, and Reception but not Mehendi. The system must enforce this at the data and authorization level.
# 8.5 Roles and Permissions
- Couple
- Wedding Admin
- Family Member
- Event Manager
- Vendor
- Guest
Example permissions include VIEW_WEDDING, EDIT_WEDDING, MANAGE_EVENTS, MANAGE_GUESTS, MANAGE_TASKS, MANAGE_EXPENSES, MANAGE_VENDORS, SEND_INVITATIONS, MANAGE_RSVP, MANAGE_DOCUMENTS, UPLOAD_PHOTOS, and MANAGE_WEBSITE.
Frontend permission checks are for user experience only. Backend authorization must enforce access control.
# 8.6 Wedding Dashboard
- Couple names and wedding date.
- Countdown in days/hours.
- Next upcoming event.
- Current wedding progress.
- Upcoming events.
- Today's priorities.
- Task statistics.
- Guest and RSVP statistics.
- Expense and budget summary.
- Vendor summary.
- Quick actions.
# 8.7 Task Planner
- Create, edit, assign, prioritize, and complete tasks.
- Associate tasks with the wedding or a specific event.
- Assign tasks to wedding members.
- Set due dates and priorities.
- Support attachments and notes.
- Statuses: To Do, In Progress, Blocked, Completed.
- Views: list, Kanban, and calendar.
# 8.8 Expense and Budget Management
- Set total wedding budget.
- Track planned and actual expenses.
- Categorize expenses.
- Associate expenses with events and vendors.
- Track payment status and due dates.
- Upload receipts.
- Track payment method and notes.
- Show budget, spent, remaining, and pending amounts.
# 8.9 Vendor Management
- Create vendor profiles.
- Store category, contact information, contract details, and notes.
- Associate vendors with one or multiple events.
- Track quoted amount, agreed amount, paid amount, and pending amount.
- Attach contracts and invoices.
- Link vendor expenses to the expense tracker.
# 8.10 Digital Invitations
- Select an invitation template.
- Customize wedding information.
- Select applicable events.
- Select guests.
- Generate a unique invitation link.
- Share the invitation.
- Connect invitation data to RSVP.
Invitation information may include couple names, dates, venues, map location, dress code, event schedule, RSVP link, wedding website, and relevant instructions.
# 8.11 RSVP Management
- Event-specific RSVP.
- Accept, decline, or pending status.
- Number of attendees.
- Accommodation requirement.
- Transportation requirement.
- Optional food preference.
- Dashboard showing invited, confirmed, declined, and pending guests.
# 8.12 Notifications and Reminders
- Wedding-level reminders.
- Event reminders.
- RSVP reminders.
- Task due reminders.
- Vendor payment reminders.
- Accommodation reminders.
- Transport reminders.
- Initial channels: in-app and email.
- Future channels: SMS and WhatsApp integrations.
Example reminder schedule: 50 days, 30 days, 7 days, 3 days, and 1 day before relevant dates. The exact schedule should be configurable.
# 8.13 Wedding Website
- Generate a public or private wedding website.
- Reuse wedding, event, venue, and schedule information already entered into the platform.
- Display couple information, event schedule, venues, RSVP, map, dress code, and selected photos.
- Avoid duplicate data entry.
- Allow the couple to control which information is public.
# 8.14 Accommodation Management
- Track guests requiring accommodation.
- Track hotels and rooms.
- Assign guests to rooms.
- Track check-in and check-out dates.
- Track accommodation payments.
- Link accommodation with transport.
# 8.15 Transportation Management
- Create pickup and drop schedules.
- Assign guests.
- Store vehicle and driver information.
- Track date and time.
- Track transportation status.
- Associate transport with events and accommodation.
# 8.16 Documents
- Upload and manage marriage-related documents, contracts, invoices, receipts, and travel/accommodation documents.
- Organize documents by category and event.
- Apply role-based access.
- Support preview, download, and deletion according to permissions.
- Provide a marriage-registration checklist.
The product should provide organization and official-process references where appropriate, but should not claim to replace government registration portals or legal services.
# 8.17 Wedding Day Mode
- Show the current event and timeline.
- Display critical tasks.
- Show assigned people and vendors.
- Display emergency contacts.
- Highlight overdue or blocked items.
- Provide quick access to venue, transport, and schedule information.
# 8.18 QR Guest Check-In
- Generate or support guest-specific/event-specific QR codes.
- Scan QR code at an event.
- Verify event access.
- Record check-in time.
- Display invited, confirmed, and checked-in counts.
# 8.19 Live Streaming
- Store an external streaming URL for an event.
- Restrict stream access according to event permissions.
- Show stream information on the relevant event page.
- Use a third-party streaming provider rather than building proprietary streaming infrastructure.
# 8.20 Memories and Photo Gallery
- Create albums by event.
- Upload and view photographs.
- Allow private or public albums.
- Support guest photo uploads with moderation.
- Allow event tagging.
- Support download and sharing based on permissions.
- Optional QR-based photo upload for guests.
# 8.21 Wedding Issues / Chaos Management
- Create an issue.
- Associate it with an event.
- Set priority.
- Assign an owner.
- Add description, notes, and attachments.
- Statuses: Open, Assigned, In Progress, Resolved.
This module is intended to provide a lightweight incident-management layer for real wedding-day problems.
# 8.22 Seating Planner
- Create tables or seating groups.
- Assign guests.
- View seating layout.
- Track special seating requirements.
- Treat as a post-MVP feature.
# 8.23 Final Wedding Analytics
- Number of events.
- Guest invitation and RSVP statistics.
- Check-in statistics.
- Task completion.
- Vendor count.
- Expense and budget summary.
- Accommodation statistics.
- Transportation statistics.
- Photo and memory statistics.
# 9. Main Navigation
- Dashboard
- Events
- Guests
- Tasks
- Expenses
- Vendors
- Invitations
- Accommodation
- Transport
- Documents
- Wedding Website
- Memories
- Settings
- Wedding Day Mode
# 10. Recommended Technology Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Vite
- Forms and validation: React Hook Form and Zod
- Server state: TanStack Query
- Client/UI state: Zustand where required
- Backend: Node.js and Express
- Database: MongoDb+Mongoose
- File storage: Object storage for photos, documents, and receipts
- Authentication: Secure session/token-based authentication
- CI/CD: GitHub Actions
- Streaming: External streaming provider
- Maps: External maps provider
- Email: Transactional email provider
PostgreSQL is recommended because the product has strongly relational data such as weddings, events, guests, event access, RSVPs, vendors, expenses, accommodation, and transportation.
# 11. Core Data Model
- User
- Wedding
- WeddingMember
- Role
- Permission
- Event
- Guest
- EventGuest
- Task
- TaskAssignee
- Vendor
- EventVendor
- Expense
- Payment
- Invitation
- RSVP
- Reminder
- Notification
- Venue
- Accommodation
- Room
- Transport
- Document
- Photo
- Album
- LiveStream
- Issue
# 12. Key Business Rules
- A guest belongs to a wedding but event access is controlled through EventGuest.
- A guest may be invited to multiple events.
- RSVP status is event-specific.
- Check-in is event-specific.
- A vendor may be associated with multiple events.
- Tasks may belong to the wedding or a specific event.
- Expenses may belong to the wedding or a specific event.
- Private documents require explicit authorization.
- Backend authorization must enforce all sensitive access rules.
- Deleting an event must not automatically delete a shared guest record.
- Wedding website content should reuse existing wedding data wherever possible.
- Guest-facing views should expose only the events and information the guest is authorized to see.
# 13. Non-Functional Requirements
- Responsive design across desktop, tablet, and mobile.
- Wedding-day workflows should be usable on mobile devices.
- Fast initial load and efficient navigation.
- Server-side pagination for large guest and transaction lists.
- Secure authentication and authorization.
- Input validation on both frontend and backend.
- Secure file upload and access control.
- Protection against common web vulnerabilities.
- Accessible UI following practical WCAG principles.
- Reliable error handling and user feedback.
- Auditability for important administrative actions.
# 14. MVP Scope
The MVP should focus on the core wedding management system rather than attempting to launch every feature simultaneously.
- Authentication
- Wedding setup
- Multiple events
- Event-level guest management
- Roles and permissions
- Wedding dashboard
- Task planner
- Expense tracker
- Vendor management
# 15. V2 Scope
- Digital invitations
- RSVP
- Notifications and reminders
- Wedding website
- Accommodation
- Transportation
- Documents and marriage checklist
# 16. V3 Scope
- Wedding Day Mode
- QR guest check-in
- Live streaming
- Photo gallery
- QR guest photo uploads
- Seating planner
- Wedding issues/chaos management
- Final wedding analytics
# 17. Suggested End-to-End User Flow
- Landing Page
- Login / Signup
- Create Wedding
- Wedding Setup Wizard
- Invite Wedding Members
- Create Events
- Add Guests
- Assign Event Access
- Assign Roles and Permissions
- Open Wedding Dashboard
- Create Tasks
- Add Vendors
- Add Expenses
- Create Invitations
- Collect RSVPs
- Manage Accommodation and Transport
- Publish Wedding Website
- Use Wedding Day Mode
- Check In Guests
- Share Live Stream
- Collect Photos
- Complete Documents
- Review Final Wedding Analytics
# 18. Connected Product Flows
The product should behave as one connected system rather than a collection of unrelated CRUD screens.
- Guest → Event → Invitation → RSVP → Accommodation → Transport → Check-In
- Event → Tasks → Vendors → Expenses → Payments → Wedding Day
- Wedding → Events → Website → Invitations → Live Stream → Memories
# 19. Success Metrics
- Number of weddings created.
- Percentage of created weddings with multiple events.
- Number of guests added per wedding.
- Percentage of guests assigned to at least one event.
- Number of invitations sent.
- RSVP completion rate.
- Task completion rate.
- Expense records created.
- Budget tracking adoption.
- Number of active wedding administrators.
- Wedding website visits.
- Event check-ins.
- Photo uploads.
- Percentage of weddings completing the core lifecycle from setup to event execution.
# 20. MVP Acceptance Criteria
- A user can create an account and log in.
- A user can create a wedding.
- A wedding can contain multiple events.
- A user can create and manage guests.
- A guest can be assigned to specific events.
- Different wedding members can receive different permissions.
- Authorized users can create and assign tasks.
- Authorized users can manage vendors.
- Authorized users can record and track expenses.
- The dashboard reflects data from the connected modules.
- A second user with restricted permissions cannot access unauthorized wedding information.
- The application works responsively on desktop and mobile.
# 21. Portfolio / Technical Positioning
My Marriage can be presented as a multi-tenant wedding management platform designed around the complexity of Indian weddings. The strongest technical story is not the number of screens but the connected data and authorization model.
- Multi-tenant wedding architecture.
- Role-based access control.
- Event-level guest authorization.
- Relational data modeling with PostgreSQL.
- Server-side pagination and filtering for large datasets.
- Responsive and mobile-first wedding-day workflows.
- Secure document and media access.
- Connected invitation, RSVP, guest, event, and dashboard workflows.
- CI/CD and production-oriented engineering practices.
# 22. Recommended Demo Scenario
- Create a sample wedding.
- Create Engagement, Mehendi, Sangeet, Wedding, and Reception events.
- Add a group of guests.
- Give different guests access to different events.
- Create Couple, Family Member, Event Manager, Vendor, and Guest accounts.
- Log in as a guest and demonstrate that only authorized events are visible.
- Send an invitation and submit an event-specific RSVP.
- Add a vendor and expense.
- Show the budget and dashboard updating.
- Complete a task and show progress changing.
- Switch to Wedding Day Mode and demonstrate event-specific execution.
# 23. Future Enhancements
- AI-assisted wedding planning.
- Smart task recommendations.
- Budget insights and forecasting.
- Automated reminder optimization.
- Vendor discovery marketplace.
- WhatsApp integration.
- SMS integration.
- Native mobile apps.
- Advanced seating optimization.
- Personalized guest communication.
- Wedding timeline generation.
- Post-wedding digital album and keepsake features.
# 24. Product Principle
Build one connected wedding system, not twenty independent CRUD modules. Every major feature should connect back to the wedding, its events, its people, its responsibilities, and its execution.
