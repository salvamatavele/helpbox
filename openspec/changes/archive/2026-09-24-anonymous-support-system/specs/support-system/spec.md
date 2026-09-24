# Capability Specification: Helpbox Anonymous Support System

## ADDED Requirements

### Requirement: Case Intake & Anonymous Tracking
The system MUST allow any citizen to submit a support request or grievance without requiring personal identification.

#### Scenario: Anonymous Case Submission
- **GIVEN** a citizen on `/new-case`
- **WHEN** the citizen fills in category, title, description, and priority
- **THEN** the system generates a unique tracking code matching `^HB-[A-Z0-9]{4}-[A-Z0-9]{3}$`
- **AND** generates a random 6-digit access PIN
- **AND** stores the PIN hashed with bcrypt (salt rounds >= 10)
- **AND** creates a persistent `Notification` record in the database
- **AND** broadcasts a real-time `NEW_CASE` event to connected caseworkers.

#### Scenario: Anonymous Case Lookup
- **GIVEN** a citizen with a valid tracking code and 6-digit PIN on `/track`
- **WHEN** the citizen inputs the credentials
- **THEN** the system verifies the bcrypt hash
- **AND** returns the case details, public status timeline, and public dialogue messages
- **AND** strictly excludes internal staff notes (`isInternalNote: false`).

### Requirement: Staff Backoffice & Triage
The system MUST allow authorized staff to triage, reassign, update status, and respond to cases.

#### Scenario: Case Triage and Progression
- **GIVEN** an authenticated caseworker on `/admin/cases/[id]`
- **WHEN** the caseworker updates status to `IN_TRIAGE` or `IN_PROGRESS`
- **THEN** the system logs an audit entry and updates `updatedAt`
- **AND** emits a status change event.

#### Scenario: Dual-Channel Communication
- **GIVEN** a caseworker responding to a case
- **WHEN** sending an official reply with `isInternalNote: false`
- **THEN** the message is visible to the citizen on `/track`
- **WHEN** sending a clinical/technical note with `isInternalNote: true`
- **THEN** the note is only visible to staff in the backoffice.

### Requirement: Team Management & Profile
The system MUST allow administrators to manage users and staff to update their profile and reset credentials.

#### Scenario: Registering a Team Member
- **GIVEN** an authenticated administrator on `/admin/users`
- **WHEN** the administrator fills name, email, role, and department
- **THEN** the system creates the user with the specified password or defaults to `admin123`.

#### Scenario: Default Password Reset
- **GIVEN** an authenticated administrator on `/admin/users`
- **WHEN** the administrator clicks "Redefinir (admin123)" for a user
- **THEN** the system updates the user's password hash to the bcrypt hash of `admin123`.

#### Scenario: Profile Update and Password Change
- **GIVEN** an authenticated user on `/admin/profile`
- **WHEN** the user provides current password and a new password (min 6 characters)
- **THEN** the system validates the current password hash before saving the new hash.

### Requirement: Real-time Notifications
The system MUST reliably deliver incoming case and message alerts to staff across all backoffice screens.

#### Scenario: Multi-Transport Real-time Notification
- **GIVEN** an open backoffice tab on any admin screen
- **WHEN** a new case or citizen message arrives
- **THEN** the event is received via SSE stream or the 15-second database poll
- **AND** an audio chime plays
- **AND** the notification bell badge increments
- **AND** the dashboard cases table automatically refreshes in real-time.
