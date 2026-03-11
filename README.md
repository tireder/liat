# ליאת | Nail Artist Booking System 💅

A modern, mobile-first booking system for nail artists with SMS notifications, course management, and client portal.

![Hebrew RTL](https://img.shields.io/badge/Language-Hebrew%20RTL-blue)
![Next.js 16](https://img.shields.io/badge/Next.js-16.1-black)
![Supabase](https://img.shields.io/badge/Database-Supabase-green)

---
r
## ✨ Features

### 📅 Booking System
- **Real-time availability** - Shows only available time slots
- **Service selection** - Multiple services with durations and prices
- **OTP verification** - Phone verification before booking
- **Booking management** - View, reschedule, or cancel bookings

### 📱 SMS Notifications
- **Booking confirmations** - Instant SMS when booking confirmed
- **Day-before reminders** - Automatic reminder 24h before appointment
- **Return reminders** - "Time to book again" after X days (configurable per service)
- **Review requests** - After completion, clients get SMS to rate their visit
- **Unsubscribe options** - Clients can opt-out of non-essential SMS

### 👩‍💼 Admin Panel 2.0
- **Dashboard** - Today's bookings, pending approvals, weekly stats
- **Booking management** - Approve, cancel, mark complete
- **Service management** - Add/edit services, pricing, duration
- **Course management** - One-time courses with registration
- **Gallery management** - Upload photos with category filtering
- **Client management** - View all clients, booking history, notes
- **Holiday blocking** - Block specific dates from booking
- **Bulk SMS** - Send marketing messages to all clients

### 🌟 Client Features
- **My Bookings portal** - View upcoming and past bookings
- **Reschedule** - Change booking date/time
- **Cancel** - Self-service cancellation
- **Review system** - Rate visits with star rating
- **Calendar sync** - Add appointment to Google Calendar

### 🎓 Courses
- **Course listing** - Browse available courses
- **Registration** - Sign up with phone verification
- **Capacity management** - Limited spots per course

### 🖼️ Gallery
- **Category filtering** - ג'ל, אקריליק, נייל ארט, פדיקור, טבעי
- **Before/After slider** - Draggable comparison tool
- **Admin upload** - Easy drag-and-drop upload

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL) |
| Styling | CSS Modules + CSS Variables |
| SMS | SMS4Free API |
| Auth | Phone OTP + Admin password |
| Hosting | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel
│   ├── book/           # Booking flow
│   ├── my-bookings/    # Client portal
│   ├── review/[token]/ # Review submission
│   ├── unsubscribe/    # SMS preferences
│   └── api/            # API routes
├── components/
│   ├── landing/        # Homepage sections
│   └── ui/             # Reusable components
└── lib/
    ├── supabase/       # Database client
    └── sms4free.ts     # SMS sending
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- SMS4Free account (for SMS)

### Environment Variables
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SMS4FREE_KEY=your_sms_key
SMS4FREE_USER=your_sms_user
SMS4FREE_SENDER=your_sender_name
CRON_SECRET=your_cron_secret
```

### Installation
```bash
npm install
npm run dev
```

### Database Setup
Run the migration files in Supabase SQL Editor:
1. `supabase/schema.sql` - Core tables
2. `database_reminder_migration.sql` - Reminder system
3. `database_new_features_migration.sql` - New features

---

## 📋 Changelog
### v2.0.5 (February 2026)
## [2026-02-05] Performance & UX Improvements
- Complete server-side rendering for all landing page sections (Services, Courses, Gallery, Reviews)
- Added skeleton loading states with shimmer animation
- Enhanced toast notifications with slide animations, warning type, and configurable duration
- Added Next.js `loading.tsx` files for instant navigation feedback
#### Bug Fixes and UI Improvments

- ✅ **Session** - Loged in for a longer preiod 30/365 days based on desciion 
- ✅ **OTP** - Auto Compleate on iphone
### v2.0.0 (February 2026)
#### New Features

- ✅ **Client Notes History** - Track notes per client with timestamps
- ✅ **Gallery Categories** - Filter by nail type (gel, acrylic, etc.)
- ✅ **Review System** - Star ratings after booking completion frontend + backend compleated 
- ✅ **Waitlist** - Join waitlist when no slots available
- ✅ **Before/After Photos** - Draggable comparison slider
- ✅ **SMS Unsubscribe** - Manage SMS preferences (added to the related sms) 

#### Improvements
- ✅ **Dashboard clickable stats** - Click week/month stats to see bookings
- ✅ **Return reminders** - Configurable per-service reminders
- ✅ **Review SMS trigger** - Auto-send when booking marked complete

### v1.5.0 (January 2026)
- ✅ **Course system** - Registration and management
- ✅ **Holiday blocking** - Block dates from admin
- ✅ **Bulk SMS** - Marketing messages

### v1.0.0 (December 2025)
- 🎉 Initial release
- Booking system with SMS
- Admin panel
- Client portal

---

## 📞 Support

For issues or feature requests, contact the developer.

---

Made with 💕 for nail artists




