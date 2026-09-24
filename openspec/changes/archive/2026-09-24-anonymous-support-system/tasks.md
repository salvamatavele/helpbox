# Tasks: Helpbox Implementation

- [x] 1. Initialize Next.js 16 with Tailwind CSS, Lucide icons, and Prisma ORM
- [x] 2. Configure MariaDB Docker container and docker-compose orchestration (ports 3004 and 8034)
- [x] 3. Design database models for Cases, Messages, Users, Departments, Notifications, and Audit Logs
- [x] 4. Build empathetic public landing page (`/`) with trust signals and quick-exit safety button
- [x] 5. Implement anonymous case intake page (`/new-case`) with tracking code and 6-digit PIN generation
- [x] 6. Implement case tracking and dialogue page (`/track`) with bcrypt PIN verification
- [x] 7. Build backoffice authentication system (`/admin/login`) with empty initial fields
- [x] 8. Develop operational caseworker dashboard (`/admin/dashboard`) with live KPIs and status filtering
- [x] 9. Implement case detail & triage interface (`/admin/cases/[id]`) with dual-channel messaging
- [x] 10. Implement team management page (`/admin/users`) with user creation and standard password reset (`admin123`)
- [x] 11. Implement profile page (`/admin/profile`) for updating personal info and password change
- [x] 12. Build hybrid real-time notifications engine (SSE + DB persistence in `Notification` model + 15s poll)
- [x] 13. Implement omnipresent `NotificationBell` with audio alert, browser desktop push, and test trigger
- [x] 14. Configure PWA manifest, service worker, dynamic favicons, sitemap, and robots.txt
- [x] 15. Create and run automated test suite (`tests/system.test.mjs`) validating codes, PINs, and i18n
