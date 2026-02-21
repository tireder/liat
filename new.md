# Mobile App – New Work Items & Phased Plan

This file defines **what to build next**, grouped by **priority phases**.
## important
## most of the text here problay aint 100% correct so before adding new features that needs to work with the web and appp  take examples and structure from the web and app and go over for each step to the relvent code and make crolate to that for example the links in 2.2 or the way something works and behaves


## Phase 0 – Hotfix (Production-Critical) Done ✅

### 0.1 Fix: Editing Appointment Creates a New One 

**Problem**  
Editing an existing appointment currently creates a **new** record instead of updating the original.

**Goal**  
When editing an appointment, the system must **update** the existing booking (same ID), not create a new one.

**Implementation Notes**

- **Frontend / App**
  - Ensure that the **appointment ID** is passed into the edit screen.
  - Use a dedicated **Update Appointment** endpoint (e.g. `PATCH /appointments/:id`) instead of the create endpoint.
  - Disable “Create” UI actions while edit is in progress (prevent double-submit).

- **Backend**
  - Add/update endpoint: `PATCH /appointments/:id`
    - Validates that appointment belongs to the authenticated user.
    - Allows changes only if appointment is in editable status (e.g. not canceled, not in the past, not locked by policy).
  - Make sure no new row is inserted:
    - Use `UPDATE` by primary key.
    - Return updated appointment object.

- **Acceptance Criteria**
  - Editing **time/service/notes** keeps **the same appointment ID**.
  - No duplicate appointments created.
  - SMS/notifications behave as “update” (not “new appointment”).
  - Logs show `update` events, not `create` for editing flow.

---

## Phase 1 – Performance Improvements

### 1.1 Improve Load Times & API Call Latency Done ✅

**Goal**  
Make the app feel faster: shorter loading times, fewer/faster API calls.

**Tasks**

1. **Reduce Number of API Calls**
   - Audit all screens and list every API call per screen.
   - Combine calls where possible:
     - Example: fetch services + artists + business config in a single “bootstrap” endpoint.
   - Avoid repeated refetching of static data (services, gallery categories, business info).

2. **Add Caching & Local Storage**
   - Cache relatively static data on device:
     - Services list
     - Gallery categories
     - Business config (phone, cancellation policy, etc.)
   - Define TTL (e.g. 24h) and invalidation rules.

3. **Optimize Heavy Endpoints**
   - Add pagination / limit for lists (appointments history, gallery, etc.).
   - Index DB queries on frequent filters:
     - by `user_id`, `artist_id`, `date`, `status`.
   - Return only necessary fields in responses (no large blobs / unused fields).

4. **Improve Perceived Performance**
   - Use skeleton loaders / shimmer instead of blank screens.
   - Preload data needed for the next screen when possible:
     - Example: when entering booking flow, start loading availability in background.

**Acceptance Criteria**
- First useful content appears in **< 1.5s** on a decent connection (target).
- Main screens reduce API calls by at least **20–30%**.
- No regression in correctness (no stale data where it matters: availability, bookings).

---

## Phase 2 – Notifications & Deep Linking ✅

### 2.1 In-App Notifications (App-Level) ✅

**Goal**  
Support notifications **from the app itself** (push or in-app) and not just SMS.

**Scope**
- Support general in-app notifications for:
  - Appointment creation / update / cancellation (optional).
  - Review requests after completed appointments.
- For reviews specifically:
  - If user has **in-app notifications ON**, do **not** send an SMS for reviews, only an app notification (see Phase 3.3).

**Implementation Notes**

- **Notification Infrastructure**
  - Integrate push notification provider (Firebase/APNS/etc.).
  - Device registers a **push token** associated with the user.
  - Store notification preferences per user (see Profile section).

- **Notification Types**
  - `APPOINTMENT_CREATED`
  - `APPOINTMENT_UPDATED`
  - `APPOINTMENT_CANCELED`
  - `REVIEW_REQUEST`

- **In-App Handling**
  - Notification center / list in the app (optional for later).
  - When user taps notification, open the correct screen via deep link (see 2.2).

**Acceptance Criteria**
- Users with notifications enabled receive push notifications for defined events.
- For review notifications:
  - If app notifications are enabled → **only app notification**, no SMS (see 3.3).

---

### 2.2 Deep Linking: Open App from Links in Messages ✅

**Goal**  
If the app is installed and the user taps a link from a message (SMS, WhatsApp, email), the app should open directly instead of the web.

**Use Cases**
- “View your appointment” link.
- “Confirm/Change appointment” link.
- “Leave a review” link.

**Implementation Notes**

- **App**
  - Implement platform deep links (e.g. app links / universal links).
  - Define URL scheme and paths, for example:
    - `https://liat-nails.art/app/booking/:id`
    - `https://liat-nails.art/app/review/:id`
    - `https://liat-nails.art/app/login`
  - Map each path to an internal app screen:
    - `/app/booking/:id` → appointment details / edit screen.
    - `/app/review/:id` → review screen for that appointment.

- **Backend / Message Templates**
  - Update SMS/WhatsApp/email templates to use these app URLs.
  - Keep web fallback:
    - If the app is not installed, the link should still work in a browser.

**Acceptance Criteria**
- When app is installed:
  - Tapping a link from a message opens the app on the correct screen.
- When app is not installed:
  - The link opens a web page with equivalent functionality (view booking, review, etc.).

---

## Phase 3 – Profile & Review Logic

### 3.1 First-Time Login → “Sign Up” Flow

**Goal**  
First-time users see a **Sign Up** screen to complete profile details.

**Behavior**
- On first login:
  - After phone verification (OTP), check if user profile exists in DB.
  - If no profile:
    - Show **Sign Up** screen.
    - Required fields:
      - Full name
      - (Optional) consent flags, e.g. marketing permissions.
- On subsequent logins:
  - Skip Sign Up, go directly to the home screen.

**Acceptance Criteria**
- New users must fill **Full name** once after first OTP.
- Existing users do **not** see the Sign Up screen again.
- Sign Up is blocked until required fields are valid.

---

### 3.2 Edit Profile (Name, Phone Number with OTP)

**Goal**  
Allow users to edit their profile details, with secure flow for phone number change.

**Scope**
- Editable fields:
  - Full name
  - Phone number
  - Notification settings (SMS vs app notifications, where applicable)

**Behavior**

- **Edit Name**
  - Simple profile form.
  - Validations: length, characters allowed.

- **Edit Phone Number**
  - User enters new phone number.
  - Validate format (e.g. starts with 05, length, etc.).
  - Send OTP to the **new** number.
  - Update phone number only after correct OTP is confirmed.
  - If OTP fails ⇒ keep old number.

**Implementation Notes**
- Backend must enforce:
  - Phone numbers are unique per user (if that’s a requirement).
  - OTP verification is required for phone changes.

**Acceptance Criteria**
- User can change name without side effects.
- Phone change is impossible without correct OTP to the **new** number.
- Login uses the updated phone after successful change.

---

### 3.3 In-App Reviews Logic (Notification vs SMS)

**Goal**  
Review requests should respect the user’s notification preference:
- If **in-app notifications are ON** → send **only app notification**, no SMS.
- If **in-app notifications are OFF** → send SMS as fallback (existing behavior).

**Behavior**

1. **After Appointment is Completed**
   - Backend triggers “review request” event for that appointment.

2. **Decision Logic**
   - If user has:
     - `app_notifications_enabled = true`
       - Send **push notification** of type `REVIEW_REQUEST`.
       - Do **not** send a review SMS.
     - `app_notifications_enabled = false`
       - Send review SMS as done today.

3. **App-Side**
   - When user taps the review notification:
     - Open review screen for that appointment (via deep link).
   - Review flow:
     - Rating (e.g. 1–5)
     - Optional free text
     - Submit → store in DB.

**Acceptance Criteria**
- Users with app notifications enabled receive all notifications including an app notification for reviews (no SMS for reviews).
- Users without app notifications continue to receive SMS review links.
- Reviews are stored and associated with their appointment + user.

---

## Phase 4 – Clean-Up & QA

### 4.1 Regression Testing

- Re-test:
  - Booking creation, editing, cancellation.
  - Notifications (all types).
  - Profile flows (first login, profile edit, phone change).
  - Deep links from real SMS/WhatsApp.

### 4.2 Analytics & Monitoring (new page in admin panel(no need for navbar to this page ) /app as the slug sot it's will be /admin/app) 

- Add basic tracking:
  - Time to open app.
  - Success/failure rate for:
    - Appointment edits
    - Notification sends
    - Deep link openings
    - Review submissions

- Error logging:
  - Log and alert failures in:
    - `PATCH /appointments/:id`
    - Notification send pipeline
    - OTP verification for phone change

---

## Priority Summary

1. **Phase 0** – Fix edit appointment bug (must fix before anything else).
2. **Phase 1** – Performance (load time & API speed).
3. **Phase 2** – App notifications + deep li
::contentReference[oaicite:0]{index=0}