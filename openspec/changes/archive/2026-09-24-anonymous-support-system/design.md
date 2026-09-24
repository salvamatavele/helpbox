# Technical Design: Helpbox Architecture

## Architecture Overview
The Helpbox platform uses a layered Domain-Driven Design (DDD) model integrated into the Next.js 16 App Router framework with React 19 and Prisma 6 ORM.

### 1. Data Layer (MariaDB & Prisma ORM)
- **`Case` Model**:
  - `trackingCode`: Unique indexed string (`HB-XXXX-YYY`).
  - `accessPinHash`: Bcrypt salted hash (10 rounds) of 6-digit access PIN.
  - `category`: `SOCIAL_SUPPORT`, `WHISTLEBLOWING`, `COMPLAINT`, `SUGGESTION`.
  - `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - `status`: `SUBMITTED`, `IN_TRIAGE`, `IN_PROGRESS`, `WAITING_INFO`, `REFERRED`, `RESOLVED`, `CLOSED`.
  - `assignedToId`, `departmentId`: Relational links for triage routing.
- **`CaseMessage` Model**:
  - `senderType`: `CITIZEN`, `STAFF`, `SYSTEM`.
  - `isInternalNote`: Boolean flag strictly segregating internal notes from citizen messages.
- **`User` & `Department` Models**:
  - Staff accounts with roles (`ADMIN`, `SOCIAL_WORKER`, `SPECIALIST`).
- **`Notification` Model**:
  - `id`, `title`, `content`, `caseId`, `isRead`, `createdAt`.

### 2. Service Layer
- **`case-service.ts`**: Pure business logic for case submission, PIN verification, status progression, triage assignment, and message creation.
- **`auth-service.ts`**: HTTPOnly base64 session cookie authentication for staff backoffice.
- **`user-service.ts`**: Team user registration, default password reset (`admin123`), and profile updates.
- **`event-bus.ts`**: Global singleton `EventEmitter` with database persistence in `prisma.notification`.

### 3. API Layer
- `/api/cases`: Case submission and backoffice listing.
- `/api/cases/track`: Citizen PIN-authenticated case status lookup and conversation.
- `/api/admin/auth`: Staff login, logout, and session check.
- `/api/admin/cases/[id]`: Status updates and department/caseworker assignments.
- `/api/admin/cases/[id]/messages`: Bidirectional replies and internal technical notes.
- `/api/admin/notifications`: List recent notifications, mark as read, and trigger test alerts.
- `/api/admin/notifications/stream`: Server-Sent Events (SSE) streaming endpoint.
- `/api/admin/users`: Team management listing and user registration.
- `/api/admin/users/[id]`: User password reset (`admin123`) and deletion.
- `/api/admin/profile`: Self-service profile information and password updates.

### 4. UI / UX Layer
- Public portal: Accessible, trauma-informed UI designed with soothing teal/emerald palettes, high emotional trust, and quick escape redirection.
- Backoffice portal: Unified navigation bar, live KPI counters, status filtering, and real-time notification bell on every screen.
- PWA support: Service Worker, web app manifest, offline cache handling, and dynamic SVG/PNG brand assets.
