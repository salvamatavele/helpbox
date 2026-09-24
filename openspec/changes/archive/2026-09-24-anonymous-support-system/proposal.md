# Proposal: Helpbox - Anonymous Social Support & Grievance System

## Problem Statement
Individuals experiencing vulnerability, psychosocial distress, harassment, or witnessing irregularities often hesitate or avoid reporting due to fear of retaliation, stigma, or loss of privacy. Existing reporting channels usually demand personal identification upfront or lack a transparent, confidential follow-up mechanism.

## Proposed Solution
Create **Helpbox**, a humanized, trauma-informed digital support and grievance management platform built with Next.js 16 App Router, React 19, Tailwind CSS, Prisma ORM, and MariaDB.

### Key Capabilities:
1. **Anonymous Reporting**:
   - Zero IP logging or mandatory personal data collection.
   - Categorized intake: Psychosocial Support, Whistleblowing/Grievance, General Complaints, Suggestions.
   - Dynamic priority rating: Normal, Medium, High, Urgent.
   - Quick-exit safety button for immediate browser redirect in unsafe environments.
2. **Confidential Tracking & Dialogue**:
   - Automated generation of a unique tracking code (e.g., `HB-XXXX-YYY`) and a 6-digit access PIN (hashed using bcrypt).
   - Citizen timeline showing case progression in empathetic Portuguese terminology.
   - Anonymous bidirectional messaging channel between citizen and caseworker without identity exposure.
3. **Caseworker & Specialist Backoffice**:
   - Secure staff authentication session (`/admin/login`).
   - Operational dashboard with real-time KPI metrics and case status filters.
   - Triage, interdepartmental referrals, and specialist assignment.
   - Public responses to citizen vs. internal confidential clinical/legal notes.
4. **Real-time Notifications**:
   - Hybrid SSE (*Server-Sent Events*) stream and database-backed event queue.
   - Persistent `Notification` records in MariaDB with unread counters.
   - Notification bell in all backoffice views with audio chime and optional desktop alerts.
   - Instant dashboard synchronization upon new case intake.
5. **Team Management & User Profile**:
   - Backoffice user registration for Caseworkers, Specialists, and Admins (`/admin/users`).
   - Default password reset capability (`admin123`).
   - Self-service profile and password update with current password verification (`/admin/profile`).
6. **Progressive Web App (PWA) & Neutral Branding**:
   - Manifest, Service Worker, dynamic icons, sitemap, robots.txt, OpenGraph cards.
   - Neutral global brand name: **Helpbox**.
7. **Containerization**:
   - Docker Compose running Next.js app (`3004:3000`), MariaDB 10.11 (`3306`), and phpMyAdmin (`8034:80`).
