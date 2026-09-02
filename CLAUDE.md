# CLAUDE.md

## Project overview

This repository contains one business system with three connected surfaces:

1. Website and admin app in the project root
   - Next.js 16 app-router application
   - Handles the main website, admin dashboard, booking flow, client portal, course booking, gallery, and backend API routes

2. API layer in the root app
   - Built with Next.js route handlers under src/app/api/
   - Handles booking creation, OTP verification, SMS triggers, admin actions, course registration, and Supabase-backed business logic

3. iPhone / mobile app in the mobile folder
   - Expo + React Native app
   - Used for the mobile customer experience and app-based flows

The project is a booking and client management system for a nail artist business, with Hebrew RTL support, Supabase, SMS notifications, admin tools, deep linking, and shared business rules across web and mobile.

---

## Repository structure

```text
/
├── README.md                         # High-level product/project summary
├── package.json                     # Root web app dependencies/scripts
├── src/                             # Root web app source
│   ├── app/                         # Next.js routes + API endpoints
│   │   ├── api/                     # Backend API route handlers
│   │   ├── admin/                  # Admin dashboard pages
│   │   ├── book/                   # Booking flow pages
│   │   ├── my-bookings/            # Client portal pages
│   │   ├── review/                 # Review submission flow
│   │   └── ...
│   ├── components/                  # Reusable UI components
│   ├── lib/                         # Shared utilities, helpers, business logic
│   └── ...
├── supabase/
│   └── schema.sql                   # Supabase schema
├── database_updates.sql             # Database migration / update script
├── public/                          # Static assets
├── mobile/                          # Expo iPhone/Android app
│   ├── app/                         # Expo Router app screens
│   ├── components/                  # Mobile components
│   ├── lib/                         # Mobile logic/helpers
│   ├── app.json                     # Expo config / app metadata
│   ├── package.json                 # Mobile app dependencies/scripts
│   └── ...
├── CLAUDE.md                       # This file
└── ...
```

---

## Primary stack

### Web app
- Next.js 16
- React 19
- TypeScript
- Supabase
- Tailwind CSS
- App Router structure

### Mobile app
- Expo SDK
- React Native
- Expo Router
- React Native Safe Area Context
- Expo Notifications
- Expo Secure Store
- iOS / Android config in app.json

---

## Important product features

- Booking system with time-slot availability
- OTP / phone verification flow
- Admin panel for bookings, services, clients, and dashboard stats
- Client portal for bookings, rescheduling, and cancellation
- SMS reminders and confirmation flows
- Course registrations and capacity management
- Gallery and before/after visual content
- Review system and rating flow
- Hebrew RTL support

---

## Root app: what to edit

When working on the main system, start in the root app under src/.

### Common folders
- src/app/ - routes and pages, including API endpoints under src/app/api/
- src/components/ - reusable UI for website/admin/client portal
- src/lib/ - shared app logic, utilities, Supabase access, business logic
- supabase/schema.sql - DB schema
- database_updates.sql - migration notes / update scripts

### Root app commands
```bash
npm install
npm run dev
npm run build
npm run lint
```

### API-specific guidance
- Treat API routes under src/app/api/ as part of the business backend, not just frontend pages.
- If a change affects booking, SMS, OTP, reviews, or admin actions, check the API route and DB schema together.
- Keep server actions and route handlers consistent with the mobile app and web app behavior.

---

## Mobile app: what to edit

The mobile app lives in the mobile/ folder and is a separate Expo app, not part of the Next.js root.

### Common folders
- mobile/app/ - screens and routes
- mobile/components/ - mobile UI components
- mobile/lib/ - mobile logic and helpers
- mobile/app.json - Expo metadata and app config

### Mobile commands
```bash
cd mobile
npm install
npx expo start
npx expo start --ios
npx expo start --android
```

---

## Environment variables

### Root web app
Typical env vars used by the system:
```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
NEXT_PUBLIC_SITE_URL=
SMS4FREE_KEY=
SMS4FREE_USER=
SMS4FREE_SENDER=
CRON_SECRET=
```

Do not hardcode secrets or production keys in source code.

### Mobile app
The mobile app uses Expo configuration and app metadata in mobile/app.json. It may also rely on app scheme/deep link config and notifications.

---

## Important project conventions

- The root project is a Next.js web application with backend API routes.
- The mobile folder is a separate Expo app and should be treated as a distinct UI client.
- The web app, API layer, and mobile app are part of the same business system and must stay behaviorally aligned.
- Do not assume the root app and mobile app share the same source code or same dependencies.
- Hebrew RTL support is a key product requirement; preserve correct alignment and directionality when editing UI.
- SMS and admin flows are business-critical; avoid breaking booking logic, verification, reminders, and admin actions.
- Preserve deep-link behavior and route compatibility for mobile and web links.
- If a feature is implemented in the website or API, think about whether the mobile app also needs the same behavior.

---

## Database and backend notes

- Supabase is the backend and database layer.
- The schema is in supabase/schema.sql.
- Database updates and migration notes live in database_updates.sql.
- Use production-safe patterns when changing data models or SQL logic.

---

## Claude Code guidance

When working in this repo:

1. Identify whether the task belongs to the website, API, or mobile app before editing.
2. Prefer the smallest relevant file and minimal change.
3. Keep product and business logic intact when changing bookings, SMS flows, auth, reviews, or admin actions.
4. Respect the existing app architecture instead of introducing a new framework or pattern.
5. If a task mentions iPhone, mobile, app, or Expo, check the mobile/ folder first.
6. If a task mentions website, admin dashboard, booking pages, API, or Next.js routes, check the root src/app/ folder first, especially src/app/api/.
7. Preserve RTL layout behavior and accessibility where possible.
8. For any shared business flow, consider the web app, mobile app, and API together before changing behavior.

---

## Suggested workflow for AI assistance

- Start with project goal and determine whether the request is website, API, or mobile
- Read the closest relevant file before editing
- Check the API route or server logic when business data or bookings are involved
- Keep business logic consistent with booking rules and Supabase schema
- Validate with the smallest relevant command after changes

---

## Quick summary

This system is a multilingual, mobile-first booking platform for nail artists built around:
- Next.js website and admin app
- Next.js API routes for booking, auth, SMS, and backend logic
- Expo React Native app for mobile users
- Supabase as database/backend
- SMS notifications for confirmations, reminders, and reviews

If asked to build or fix something, treat the website, API, and mobile app as connected parts of the same business system.
