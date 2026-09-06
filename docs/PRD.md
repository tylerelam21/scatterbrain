# PRD

# Engineering Product Requirements Document
## Personal Hub — Working Title

**Status:** Draft v0.1  
**Product type:** Private personal operating system + public personal website  
**Primary user:** Owner  
**Platforms:** Responsive web, desktop-first but excellent on mobile  
**Deployment target:** Vercel  
**V1 objective:** Create a personal website the owner instinctively opens both to understand the day and capture thoughts before they disappear.

---

# 1. Executive Summary

Personal Hub is a personal digital headquarters combining:

- unified calendar management
- rapid thought capture
- journaling
- coding/project portfolio
- photography portfolio
- personal search
- public/private publishing

The long-term product expands into:

- personalized local activity discovery
- semantic connections between ideas
- resurfacing of forgotten thoughts
- intelligent recommendations based on free time
- a “Wander” system that proposes things to do

The application should not feel like traditional productivity software.

It should feel like a **personal environment**.

The user should be able to open the site and immediately answer:

1. What am I doing today?
2. What should I know about the next few days?
3. What was I thinking about recently?
4. Where can I put this thought before I forget it?
5. What am I building?
6. What am I creating?
7. What interesting things could I do?

The product has two overlapping identities:

### Private OS

Authenticated owner experience containing:

- calendar
- Brain
- journal
- private projects
- private photography
- settings
- future recommendations

### Public Site

Unauthenticated visitors can see only content explicitly marked `PUBLIC`, primarily:

- projects
- experiments
- photography
- selected writing

There should not be a visually separate `/dashboard` product.

Authentication should reveal additional capabilities within the same digital environment.

---

# 2. Product Vision

Build a personal digital space that is:

**Fast enough to capture a thought in seconds.**

**Beautiful enough that the user wants to inhabit it.**

**Flexible enough to hold unfinished ideas.**

**Structured enough to become useful memory.**

**Public enough to showcase creative work.**

**Private enough to become trusted with real life.**

Long-term, the system should evolve from storing information into helping the user notice relationships between:

- time
- ideas
- interests
- places
- projects
- creative work
- previous experiences

---

# 3. Product Principles

## 3.1 Capture first. Organize later.

Thought capture must never require:

- choosing a folder
- selecting a category
- adding tags
- naming a document
- deciding whether something is a note, task, or project

A user should be able to type something and hit Enter.

Metadata can be added later manually or automatically.

---

## 3.2 Private by default.

Any content created while authenticated defaults to:

`PRIVATE`

Nothing becomes publicly accessible without an explicit visibility change.

---

## 3.3 One environment, not six disconnected apps.

Calendar, Brain, journal, portfolio, and photos should share:

- search
- navigation
- identity
- related-content infrastructure
- visibility rules
- design language

---

## 3.4 Do not build Notion.

Avoid requiring the user to create databases and organizational systems before the product becomes useful.

The product should increasingly organize information on behalf of the user.

---

## 3.5 Creativity may break the UI rules.

Utility surfaces should be predictable.

Creative surfaces may be expressive.

Calendar and journal should prioritize usability.

Photography and Lab should be allowed to use:

- unconventional layouts
- animation
- oversized typography
- experimental interactions
- full-screen media

---

## 3.6 External systems remain authoritative where appropriate.

Google Calendar remains the source of truth for Google events.

The application synchronizes and caches calendar data but does not create a competing calendar silo.

---

# 4. Success Criteria

V1 succeeds if the following behaviors emerge:

### Daily orientation

The owner regularly visits Home to understand the day.

### Habitual capture

When the owner has a random thought, the site becomes one of the first places they instinctively put it.

### Trusted calendar

The owner is comfortable creating and modifying real calendar events from Personal Hub.

### Creative representation

The public portion becomes a legitimate link the owner can send someone to demonstrate:

- coding
- design/building
- photography
- personality

### Low maintenance

The system does not create significant organizational work for the user.

---

# 5. Non-Goals for V1

V1 is not:

- a team collaboration product
- a CRM
- a full task-management system
- a replacement for Google Calendar infrastructure
- a social network
- an email client
- a general-purpose note-taking product
- a native iOS application
- an AI chatbot
- an automated life coach
- a full recommendation engine
- a full CMS for multiple authors

These may influence architecture but must not expand V1 scope.

---

# 6. V1 Feature Scope

## Required

1. Authentication
2. Home dashboard
3. Quick Capture
4. Brain
5. Journal
6. Google Calendar connection
7. Unified calendar
8. Calendar event manipulation
9. Work/projects
10. Lab/experiments
11. Photography
12. Public/private visibility
13. Global search
14. Command palette
15. Responsive mobile interface
16. Settings

## Explicitly deferred

- Discover recommendation engine
- Wander
- semantic/vector search
- AI automatic tagging
- automatic idea relationship generation
- external activity ingestion
- weather integration
- location-aware suggestions
- GitHub automatic project ingestion
- native app
- multi-user support

---

# 7. Information Architecture

Primary routes:

```text
/
 /calendar
 /brain
 /brain/[id]
 /journal
 /journal/[id]
 /work
 /work/[slug]
 /lab
 /photos
 /photos/[slug]
 /search
 /settings
 /login
```

Future routes:

```text
/discover
/discover/saved
/wander
/map
```

Public visitors may access:

```text
/
 /work
 /work/[slug]
 /lab
 /photos
 /photos/[slug]
```

Only when associated content is public.

Authenticated users see the full environment.

---

# 8. Navigation

Desktop navigation should remain minimal.

Recommended primary navigation:

**Home**

**Calendar**

**Brain**

**Journal**

**Work**

**Photos**

Secondary:

**Lab**

**Search**

**Settings**

Future:

**Discover**

A persistent global command palette must be available via:

`⌘ K` on macOS

`Ctrl K` on Windows

Mobile should provide equivalent navigation and Quick Capture access.

---

# 9. Authentication

## 9.1 Requirements

V1 is single-user.

Only one account should have owner privileges.

Recommended authentication:

Google OAuth.

The owner account must be stored in an environment/config allowlist or validated against an owner email stored during deployment.

Unknown authenticated users must not gain access to private routes.

---

## 9.2 Sessions

Requirements:

- secure HTTP-only cookies
- server-side session validation
- CSRF protection where applicable
- no access tokens exposed to browser JavaScript unnecessarily
- automatic session refresh
- explicit logout

---

# 10. Home

Home is the primary daily interface.

It should synthesize information rather than simply provide links to other modules.

## 10.1 Header

Display:

- date
- contextual greeting or concise status
- avatar/profile affordance
- command/search affordance

Example:

**Sunday, September 6**

Optional contextual line:

> Three things today. Evening is open.

---

## 10.2 Quick Capture

Quick Capture is a first-class V1 feature.

Prominent input:

> What’s on your mind?

### Behavior

User enters arbitrary text.

Pressing Enter:

1. immediately persists the content
2. creates a Brain item
3. timestamps it
4. marks it `PRIVATE`
5. clears the input
6. shows subtle success feedback

The interaction should not open another page.

Target interaction time:

**< 5 seconds from page open to thought saved.**

### Optional actions

Quick Capture may support:

- multiline expansion
- paste links
- keyboard shortcut
- mobile floating button
- voice dictation through device-native input

AI processing must not block saving.

---

## 10.3 Today

Display calendar events occurring today.

Each event should show:

- title
- start/end
- calendar identity
- location when available

Clicking opens event detail/editor.

---

## 10.4 Upcoming

Show a short horizon, initially:

**next 7 days**

Prioritize:

- meaningful calendar events
- all-day events
- saved future objects when supported

Avoid recreating the full calendar here.

---

## 10.5 Recent Brain

Display recent captured thoughts.

Recommended count:

3–5.

Allow:

- click to open
- quick pin
- quick archive

---

## 10.6 Resurfaced Thought

V1 should implement a simple non-AI resurfacing mechanism.

Eligible items:

- older than 14 days
- not archived
- not resurfaced recently

Display at most one.

Example:

> From 72 days ago

The algorithm may initially be random with reasonable exclusion rules.

V2 replaces this with relevance-aware resurfacing.

---

# 11. Brain

Brain is the low-friction repository for incomplete thinking.

It is not a traditional document system.

## 11.1 Brain item

Required properties:

- ID
- content
- createdAt
- updatedAt
- visibility
- archived
- pinned

Optional:

- title
- type
- tags
- source URL
- associated date
- metadata

---

## 11.2 Brain item types

V1 types:

- THOUGHT
- IDEA
- QUESTION
- QUOTE
- PLACE
- RECOMMENDATION
- PROJECT_IDEA
- OTHER

Type is optional.

Default:

`THOUGHT`

Users must not be required to choose a type during capture.

---

## 11.3 Brain list

Default sorting:

newest first.

Support:

- search
- type filter
- tag filter
- pinned-only
- archived
- date range

---

## 11.4 Brain detail

User can:

- edit content
- add title
- change type
- add/remove tags
- change visibility
- archive
- delete
- pin
- convert to journal entry

---

## 11.5 Convert to Journal

Action:

**Expand into journal entry**

Behavior:

1. create journal draft
2. preserve original thought
3. prepopulate journal body
4. create relationship between source Brain item and Journal entry

Brain item should not be destroyed.

---

# 12. Journal

Journal supports deliberate long-form writing.

## 12.1 Journal editor

Requirements:

- autosave
- rich text
- Markdown keyboard shortcuts
- headings
- lists
- block quotes
- links
- inline images
- distraction-free writing mode
- word count
- created timestamp
- last edited timestamp

Recommended editor framework:

Tiptap or equivalent extensible structured editor.

---

## 12.2 Journal metadata

Fields:

- ID
- title
- content
- plainText
- journalDate
- createdAt
- updatedAt
- visibility
- tags
- status

Statuses:

- DRAFT
- COMPLETE
- ARCHIVED

Default visibility:

`PRIVATE`

---

## 12.3 Journal navigation

Support:

- chronological timeline
- calendar/date browsing
- search
- tags

---

## 12.4 Autosave

Autosave requirements:

- debounce approximately 500–1500ms
- visible saving state
- visible saved state
- recover gracefully from network failure
- never erase newer client text due to stale server response

---

# 13. Calendar Integration

## 13.1 Supported provider

V1:

**Google Calendar**

Multiple Google accounts must be supported.

Expected use case:

- personal Google account
- work Google account

---

## 13.2 OAuth permissions

Request the narrowest permissions needed to:

- view the user's calendar list
- view events
- create events
- update events
- delete events

Prefer event-specific permissions rather than full calendar administrative access when possible.

Google currently exposes event read/write scopes separately from broader calendar permissions.

Do not request ACL/sharing administration privileges for V1.

---

# 14. Calendar Connections

Each connected Google identity becomes a `CalendarConnection`.

Store:

- provider account identifier
- account email
- encrypted access token where required
- encrypted refresh token
- token expiration
- granted scopes
- connection status
- last sync timestamp
- sync cursor/token
- createdAt
- updatedAt

Tokens must never be returned to normal frontend API payloads.

---

# 15. Calendar Sync Model

Google is authoritative.

Local storage exists for:

- performance
- unified rendering
- search
- offline-ish resilience
- linking calendar events to future internal objects

## Initial sync

When an account is connected:

1. retrieve available calendars
2. store calendar metadata
3. retrieve relevant events
4. normalize/cache event records
5. save sync state

## Incremental sync

Subsequent syncs should request only changes when provider functionality allows.

Refresh on:

- page load if stale
- manual refresh
- successful event write
- scheduled server synchronization

Provider webhook/push synchronization may be added if needed after V1 reliability is established.

---

# 16. Calendar UI

Required views:

### Week

Primary desktop view.

### Month

Planning overview.

### Day

Detailed daily view.

Mobile may default to:

- day
- agenda
- compact week

---

# 17. Calendar Controls

Allow user to:

- enable/disable individual calendars
- distinguish calendars visually
- connect another Google account
- disconnect account
- choose default calendar
- select time zone
- hide declined events
- optionally show weekends

---

# 18. Event Creation

Support click/drag creation.

Required fields:

- title
- date
- start
- end

Optional:

- all day
- calendar
- location
- description
- attendees
- conferencing link when supported

Google requires start/end values for created events, with timed and all-day events represented differently.

Default calendar:

user-selected default.

---

# 19. Event Editing

User must be able to:

- change title
- move start
- move end
- drag event
- resize duration
- change location
- edit description
- move between writable calendars when feasible
- add/remove attendees
- delete event

Any successful write must:

1. write to provider
2. confirm provider success
3. update local cache
4. visually reconcile UI state

If provider write fails, optimistic UI changes must roll back.

---

# 20. Recurring Events

V1 must correctly display recurring events.

Editing recurring events should distinguish:

- this event
- this and following events
- entire series

If supporting all recurrence-edit cases materially delays V1, read/display is mandatory and complex series modification can be initially delegated to Google Calendar via a fallback action.

---

# 21. Portfolio — Work

Work represents polished and semi-polished technical projects.

## Project fields

- ID
- slug
- title
- tagline
- summary
- body
- heroImage
- status
- visibility
- technologies
- repositoryUrl
- liveUrl
- sortOrder
- featured
- createdAt
- updatedAt
- publishedAt

Statuses:

- LIVE
- IN_PROGRESS
- EXPERIMENT
- ARCHIVED

---

# 22. Project Page

Recommended content structure:

1. Hero
2. Project summary
3. Problem
4. Approach
5. Screenshots/media
6. Architecture
7. Technologies
8. Lessons
9. Links

Content structure should remain flexible enough that not every project requires every section.

---

# 23. Lab

Lab contains lower-stakes technical experiments.

Lab may initially reuse the Project model with:

`isLab = true`

or

`category = LAB`

Avoid creating a separate data model unless behavior diverges materially.

Lab items can be:

- experiments
- prototypes
- visualizations
- tiny applications
- interactive art
- tools
- unfinished concepts

The UI can be more experimental than Work.

---

# 24. Photography

Photography prioritizes images above metadata.

## Photo model

Fields:

- ID
- storageKey
- originalFilename
- width
- height
- aspectRatio
- title
- caption
- altText
- dateTaken
- locationLabel
- camera
- lens
- visibility
- sortOrder
- createdAt
- updatedAt

Optional future fields:

- latitude
- longitude
- filmStock
- focalLength
- aperture
- ISO
- shutterSpeed

Do not require metadata.

---

# 25. Photo Collections

Fields:

- ID
- slug
- title
- description
- coverPhotoId
- visibility
- sortOrder
- createdAt
- updatedAt

Many-to-many relationship:

`PhotoCollectionItem`

supports:

- collectionId
- photoId
- sortOrder

A photo may appear in multiple collections.

---

# 26. Photo Upload

V1 should support:

- drag/drop
- file picker
- multiple uploads
- upload progress
- automatic dimension extraction
- thumbnail/optimized derivative generation
- manual alt text
- adding to collection
- visibility assignment

Default visibility:

`PRIVATE`

Recommended object storage:

S3-compatible storage such as Cloudflare R2.

Do not store large image binaries directly in PostgreSQL.

---

# 27. Public/Private Visibility

Shared enum:

```text
PRIVATE
UNLISTED
PUBLIC
```

## PRIVATE

Accessible only to owner.

## UNLISTED

Accessible through direct URL but:

- excluded from indexes
- excluded from navigation
- excluded from site search for unauthenticated users

## PUBLIC

Available publicly and eligible for:

- portfolio pages
- public search
- metadata
- sitemap

---

# 28. Visibility Enforcement

Visibility must be enforced server-side.

Never rely solely on hiding private links in frontend code.

Every server query serving unauthenticated traffic must filter private records.

Tests must explicitly verify that guessed private URLs cannot retrieve content.

---

# 29. Search

V1 search should be global.

Searchable content:

- Brain
- Journal
- Projects
- Lab
- Photo title/caption/location metadata
- cached calendar events

---

## 29.1 Search implementation

Start with PostgreSQL search.

Support:

- normalized text
- partial matching
- ranked results
- content-type filtering

Do not implement vector embeddings in V1.

Architecture should allow a later semantic search layer.

---

# 30. Command Palette

Open via:

`⌘ K / Ctrl K`

Initial commands:

- Search everything
- Capture thought
- New journal entry
- New calendar event
- Open Calendar
- Open Brain
- Open Journal
- Open Work
- Open Photos
- Open Settings

Search results should be keyboard navigable.

---

# 31. Design Requirements

## Overall aesthetic

Desired qualities:

- sharp
- fun
- highly polished
- editorial
- personal
- modern
- visually confident
- not SaaS-generic

Avoid excessive:

- rounded cards
- gray dashboard panels
- gradients for decoration
- unnecessary borders
- “AI app” styling
- productivity-game mechanics

---

# 32. Typography

Typography should be a major part of the identity.

Use:

- one primary UI sans-serif
- optionally one expressive editorial/display typeface

Utility surfaces prioritize legibility.

Creative surfaces may use dramatically scaled typography.

---

# 33. Motion

Motion should communicate:

- hierarchy
- navigation
- causality
- personality

Use animation for:

- page transitions
- command palette
- Quick Capture confirmation
- hover states
- image transitions
- selected navigation state

Do not animate every component.

Respect:

`prefers-reduced-motion`

---

# 34. Responsive Requirements

The website must function at minimum across:

- modern desktop
- laptop
- tablet
- modern mobile browser

Quick Capture must remain especially accessible on mobile.

A floating capture affordance is recommended.

Calendar mobile behavior should prioritize usefulness over recreating the desktop grid.

---

# 35. Accessibility

Target:

WCAG 2.2 AA where practical.

Requirements:

- semantic HTML
- keyboard navigation
- visible focus
- accessible dialogs
- form labels
- alt text infrastructure
- sufficient contrast
- reduced-motion support
- screen-reader labels for icon-only controls

---

# 36. Recommended Technology Stack

## Application

**Next.js**
App Router + TypeScript.

At implementation start, use the current patched Active LTS release rather than freezing the PRD to a specific patch version.

## UI

- React
- Tailwind CSS
- custom CSS
- Motion for React or equivalent

## Database

PostgreSQL.

Recommended hosted options:

- Neon
- Supabase Postgres

## ORM

Recommended:

**Drizzle ORM**

Alternative:

Prisma.

Choose one and do not mix ORMs.

## Authentication

Auth.js or equivalent mature OAuth solution.

## Editor

Tiptap.

## Validation

Zod or equivalent schema validation.

## Storage

Cloudflare R2 or S3-compatible storage.

## Hosting

Vercel.

---

# 37. High-Level Architecture

```text
Browser
   ↓
Next.js Application
   ↓
Server Actions / Route Handlers
   ↓
Domain Services
   ├── Brain Service
   ├── Journal Service
   ├── Calendar Service
   ├── Portfolio Service
   ├── Photo Service
   └── Search Service
   ↓
PostgreSQL

External Systems
   ├── Google OAuth
   ├── Google Calendar API
   └── Object Storage
```

Application code should avoid calling external APIs directly from React components.

External integrations should live behind service abstractions.

---

# 38. Suggested Code Organization

```text
src/
  app/
    (public)/
    (private)/
    api/

  components/
    ui/
    calendar/
    brain/
    journal/
    work/
    photos/
    command/

  lib/
    auth/
    db/
    calendar/
    storage/
    search/
    validation/

  server/
    services/
    repositories/

  types/
```

Separation should remain pragmatic.

Do not over-engineer domain-driven architecture for a one-person application.

---

# 39. Core Database Model

Suggested conceptual schema:

```text
User

OAuthConnection
CalendarConnection
Calendar
CalendarEvent

BrainItem
Tag
BrainItemTag

JournalEntry
JournalEntryTag

ContentRelationship

Project
ProjectMedia
ProjectTechnology

Photo
PhotoCollection
PhotoCollectionItem

SearchDocument

AppSetting
```

---

# 40. User

```text
User
- id
- email
- name
- image
- role
- createdAt
- updatedAt
```

V1 role:

`OWNER`

Architecture may support future roles without implementing them.

---

# 41. BrainItem

```text
BrainItem
- id
- userId
- title?
- content
- type
- visibility
- pinned
- archived
- sourceUrl?
- createdAt
- updatedAt
```

---

# 42. JournalEntry

```text
JournalEntry
- id
- userId
- title
- contentJson
- plainText
- journalDate
- visibility
- status
- createdAt
- updatedAt
```

Store structured editor data plus normalized plain text for search.

---

# 43. ContentRelationship

Create this model in V1 even if lightly used.

```text
ContentRelationship
- id
- sourceType
- sourceId
- targetType
- targetId
- relationshipType
- createdAt
```

Initial relationship types:

- EXPANDED_FROM
- RELATED_TO
- REFERENCES

This creates infrastructure for future semantic relationships.

---

# 44. CalendarConnection

```text
CalendarConnection
- id
- userId
- provider
- providerAccountId
- email
- encryptedAccessToken?
- encryptedRefreshToken?
- expiresAt?
- scopes
- syncToken?
- lastSyncedAt?
- status
- createdAt
- updatedAt
```

---

# 45. Calendar

```text
Calendar
- id
- connectionId
- providerCalendarId
- name
- description?
- providerColor?
- customColor?
- timeZone?
- accessRole
- enabled
- isPrimary
- createdAt
- updatedAt
```

---

# 46. CalendarEvent Cache

```text
CalendarEvent
- id
- calendarId
- providerEventId
- recurringEventId?
- title
- description?
- location?
- start
- end
- allDay
- status
- organizer?
- attendeesJson?
- htmlLink?
- etag?
- providerUpdatedAt?
- lastSyncedAt
```

Create a unique constraint on:

```text
calendarId + providerEventId
```

---

# 47. Project

```text
Project
- id
- slug
- title
- tagline?
- summary?
- contentJson?
- plainText?
- status
- visibility
- isLab
- featured
- heroImageId?
- repositoryUrl?
- liveUrl?
- sortOrder
- publishedAt?
- createdAt
- updatedAt
```

---

# 48. Photo

```text
Photo
- id
- storageKey
- thumbnailKey?
- width
- height
- title?
- caption?
- altText?
- dateTaken?
- locationLabel?
- camera?
- lens?
- visibility
- createdAt
- updatedAt
```

---

# 49. API / Server Actions

Prefer server actions for tightly coupled authenticated UI mutations where appropriate.

Use route handlers for:

- OAuth callbacks
- external webhooks
- upload signing
- integration callbacks
- future public API endpoints

Example domain operations:

```text
captureBrainItem()
updateBrainItem()
archiveBrainItem()

createJournalEntry()
updateJournalEntry()

connectGoogleCalendar()
syncCalendarConnection()
createCalendarEvent()
updateCalendarEvent()
deleteCalendarEvent()

createProject()
publishProject()

createPhotoUpload()
updatePhoto()
createPhotoCollection()

searchAll()
```

---

# 50. Error Handling

User-facing errors should:

- explain what failed
- preserve user input
- offer retry when possible
- avoid exposing internal stack traces

Calendar failures must distinguish:

- connection expired
- insufficient permissions
- provider unavailable
- event changed remotely
- calendar is read-only
- network failure

---

# 51. Observability

V1 should include:

- structured server logs
- provider integration error logging
- calendar sync status
- upload failures
- authentication failures

Recommended optional tooling:

Sentry or equivalent.

Avoid invasive user analytics unless there is a clear reason.

This is primarily a personal product.

---

# 52. Security Requirements

## Secrets

All secrets must be environment variables.

Never commit:

- OAuth client secrets
- database credentials
- encryption keys
- storage credentials

---

## Calendar tokens

Refresh tokens must be encrypted at rest.

Use an application-level encryption key separate from the database.

---

## Authorization

Every private mutation must verify:

1. authenticated user
2. owner authorization
3. ownership of requested resource

Never trust IDs supplied by the browser without authorization checks.

---

## Public content

Public rendering queries should use an explicit public-content path rather than fetching arbitrary content and hiding it afterward.

---

# 53. Backups

Database provider must support automated backups or point-in-time recovery.

Photo storage should use durable object storage.

Journal and Brain content are considered valuable personal data.

A future export function should support:

- JSON
- Markdown
- image archive

Data export is not required for first launch but should remain feasible.

---

# 54. Performance Targets

Target:

### Public pages

LCP under approximately 2.5 seconds on reasonable broadband/mobile connections.

### Quick Capture

Optimistic response visible immediately.

Server persistence should normally complete under 1 second.

### Search

Typical local search results:

under 500ms server response target.

### Calendar

Cached week view should render without waiting on Google.

External synchronization should occur asynchronously relative to normal rendering where possible.

---

# 55. Image Performance

Photography pages must:

- use responsive image sizes
- lazy load below-fold images
- preserve aspect ratio
- avoid layout shift
- deliver optimized formats where possible
- retain access to high-quality originals

Do not aggressively compress photography to the point that visible quality suffers.

---

# 56. V1 User Stories

## Home

**As the owner, I want to open the site and immediately understand my day so that the site becomes my daily starting point.**

Acceptance:

- today's events visible
- upcoming events visible
- Quick Capture visible
- recent Brain items visible

---

## Quick Capture

**As the owner, I want to save an incomplete thought without deciding what it is so I don't lose the idea.**

Acceptance:

- type thought
- press Enter
- thought persists
- private by default
- interaction requires no metadata

---

## Calendar

**As the owner, I want my personal and work calendars visible together so I do not need to switch between accounts.**

Acceptance:

- connect two Google accounts
- both calendar sets render
- individual calendars can be toggled

---

## Calendar editing

**As the owner, I want to manipulate my calendar from the site so this becomes a real operating interface rather than a read-only dashboard.**

Acceptance:

- create event
- edit event
- drag event
- change duration
- delete event
- change appears in Google Calendar

---

## Journal

**As the owner, I want a calm space for longer writing so that deliberate reflection does not get mixed with quick thoughts.**

Acceptance:

- new entry
- autosave
- reopen
- edit
- search
- private by default

---

## Portfolio

**As a visitor, I want to understand what the owner has built without seeing private information.**

Acceptance:

- public projects accessible
- private projects inaccessible
- project case studies render well mobile/desktop

---

## Photography

**As a visitor, I want photography presented beautifully without excessive interface chrome.**

Acceptance:

- collections
- responsive images
- full image emphasis
- optional captions
- private images inaccessible

---

## Search

**As the owner, I want to search across the different parts of my digital life from one place.**

Acceptance:

query can return results from at least:

- Brain
- Journal
- Projects
- Photos
- Calendar

---

# 57. V1 Release Acceptance Criteria

V1 is release-ready when all of the following are true:

### Authentication
- owner can log in
- non-owner cannot access private environment

### Brain
- capture works
- edit works
- archive works
- search works

### Journal
- creation works
- autosave is reliable
- entries persist
- search works

### Calendar
- multiple accounts connect
- events synchronize
- events can be created
- events can be changed
- events can be deleted
- read-only calendars are respected
- expired authorization can recover gracefully

### Portfolio
- projects can be created
- visibility works
- public project pages work

### Photography
- image upload works
- collection creation works
- responsive display works
- visibility works

### Search
- unified results work

### Public/private
- automated tests verify private records cannot leak publicly

### Mobile
- Quick Capture is easy
- daily calendar is usable
- Brain and journal are functional

---

# 58. Testing Strategy

## Unit tests

Focus on:

- visibility rules
- normalization functions
- calendar data transformations
- permission checks
- search formatting

## Integration tests

Focus on:

- database mutations
- OAuth connection lifecycle
- calendar synchronization
- project publication
- image metadata

## End-to-end tests

Critical flows:

1. Login
2. Quick Capture
3. Create journal entry
4. Connect calendar
5. Create calendar event
6. Edit event
7. Publish project
8. Verify public project
9. Verify private object inaccessible
10. Upload photo

Use Playwright or equivalent.

---

# 59. Development Sequence

## Phase 0 — Foundation

Build:

- repository
- Next.js
- TypeScript
- linting
- formatting
- database
- migrations
- authentication
- protected/private layout
- public layout
- design tokens

Exit criteria:

owner can authenticate and private routes are secured.

---

## Phase 1 — Brain

Build:

- Brain schema
- Quick Capture
- Brain list
- Brain detail
- edit/archive/pin
- tags
- Home recent thoughts

Why first:

This establishes the application's most important habit loop with minimal integration complexity.

---

## Phase 2 — Journal

Build:

- editor
- autosave
- journal timeline
- tags
- Brain → Journal relationship
- resurfacing foundation

---

## Phase 3 — Calendar

Build:

- Google connection
- multiple accounts
- calendar metadata
- synchronization
- week view
- day view
- month view
- event detail
- create/edit/delete
- drag/resize

Do not continue until calendar edits are trustworthy.

---

## Phase 4 — Home

Now combine:

- calendar
- Quick Capture
- recent Brain
- upcoming
- resurfaced thought

Home should now become the default authenticated route.

---

## Phase 5 — Work + Lab

Build:

- project CMS/editor
- project pages
- public visibility
- featured projects
- Lab filtering

---

## Phase 6 — Photography

Build:

- object storage
- uploads
- metadata
- collections
- public galleries
- fullscreen/lightbox experience

---

## Phase 7 — Global Search + Command Palette

Build:

- unified database search
- result grouping
- keyboard navigation
- creation commands
- navigation commands

---

## Phase 8 — Polish

Focus on:

- animations
- typography
- responsive behavior
- accessibility
- public SEO
- error states
- loading states
- empty states
- performance
- backups
- monitoring

---

# 60. V2 — Discover

Discover introduces personalized activity recommendations.

Possible source classes:

- local publications
- venue calendars
- museums
- theaters
- sports
- Ticketmaster
- Eventbrite
- restaurant/event guides
- selected newsletters
- public calendars

All source ingestion should normalize into an internal `Activity` model.

---

# 61. Future Activity Model

```text
Activity
- id
- title
- description
- category
- venue
- address
- latitude
- longitude
- startAt
- endAt
- source
- sourceUrl
- imageUrl
- priceMin
- priceMax
- normalizedFingerprint
- createdAt
- updatedAt
```

---

# 62. Recommendation Signals

Future interactions:

- SAVE
- INTERESTED
- GOING
- NOT_INTERESTED
- VIEWED
- ADDED_TO_CALENDAR

Recommendation ranking can eventually incorporate:

- category preferences
- interaction history
- geographic distance
- schedule availability
- timing
- price
- novelty
- source preference

---

# 63. V2 — Semantic Brain

Add embeddings for:

- Brain items
- Journal entries
- Projects
- selected external content

Capabilities:

### Related thoughts

> These two ideas may be connected.

### Semantic search

Search:

> that thing I wrote about photographing abandoned places

without remembering exact wording.

### Intelligent resurfacing

Old thoughts chosen by relevance rather than randomness.

### Current Threads

Automatically identify clusters of ideas repeatedly appearing over time.

---

# 64. V3 — Wander

Wander answers:

> What should I do?

Inputs:

- current time
- available calendar window
- approximate location
- interests
- saved activities
- live activities
- weather
- travel time
- preference history

Modes:

- Wander for 1 hour
- Wander for 2 hours
- Wander tonight
- Wander Saturday
- Surprise me

Output should be a small curated plan rather than an enormous list.

Example:

```text
2:00
Lunch

3:15
Photography exhibition

5:00
Walk / photograph neighborhood

6:45
Sunset
```

Each Wander plan can be:

- saved
- modified
- added to calendar

---

# 65. Future Daily Intelligence

Home may eventually produce subtle synthesized observations.

Examples:

> Your afternoon is unusually open.

> You have three unfinished thoughts about photography from this month.

> You saved an event for tonight but haven't added it to your calendar.

> This project hasn't been touched in three weeks.

These should remain quiet observations rather than nagging notifications.

No streaks.

No guilt.

No productivity scoring.

---

# 66. Product Tone

The site may occasionally use playful copy.

Examples:

> Nothing tonight. Dangerous.

> Your brain left this here three months ago.

> Apparently you keep thinking about film photography.

> Saturday afternoon is suspiciously empty.

Tone should be:

- dry
- curious
- understated
- occasionally surprising

Never motivational or patronizing.

---

# 67. Design North Star

Utility screens should feel like excellent software.

Creative screens should feel like a personal magazine.

The entire product should feel like it belongs to one person rather than a hypothetical market segment.

The site itself should become part of the portfolio.

---

# 68. Engineering Guardrails

During implementation:

**Do not add features merely because a library makes them easy.**

**Do not introduce a generic CMS.**

**Do not make classification mandatory for Brain capture.**

**Do not expose private content client-side and rely on CSS/UI hiding.**

**Do not store Google Calendar as an independent competing source of truth.**

**Do not build Discover before the core capture/calendar loop feels excellent.**

**Do not introduce AI into workflows where deterministic software is sufficient.**

**Do build reusable infrastructure for relationships and search so intelligence can be added later.**

---

# 69. North-Star Workflow

A representative future day:

### Morning

User opens the site.

Home shows:

- today's calendar
- a meeting later
- an open evening
- one resurfaced thought

### 10:43 AM

User has an idea.

Opens command palette.

Types:

> photography project about the weird architecture of suburban churches

Presses Enter.

Done.

### Afternoon

User drags tomorrow's 3 PM meeting to 4 PM.

Google Calendar updates.

### Evening

User opens Journal and writes for fifteen minutes.

### Later

User uploads several photographs into a private collection.

Eventually publishes the collection.

### Future version

Discover notices that the user has Saturday afternoon free and surfaces a film screening and photography exhibition.

Wander combines them into a suggested afternoon.

This is the intended product loop.

---

# 70. Product North Star

**Capture without friction.  
Surface what matters.  
Make curiosity visible.**

The product should gradually become a map of the owner's life without requiring the owner to manually maintain the map.
