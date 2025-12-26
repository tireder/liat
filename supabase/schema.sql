-- ==========================================
-- Nail Salon PWA Database Schema
-- Run this in Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- SERVICES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price INTEGER NOT NULL, -- in ILS
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- COURSES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  duration TEXT NOT NULL, -- e.g., "8 שעות"
  price INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CLIENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BOOKINGS TABLE (with state machine)
-- ==========================================
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'pending_change',
  'cancelled',
  'completed',
  'no_show'
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TEXT NOT NULL, -- e.g., "14:00"
  end_time TEXT NOT NULL,
  status booking_status DEFAULT 'confirmed',
  notes TEXT,
  -- For reschedule requests
  requested_date DATE,
  requested_time TEXT,
  -- Slot locking
  locked_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_date ON bookings(date, status);
CREATE INDEX idx_bookings_client ON bookings(client_id);

-- ==========================================
-- BOOKING LOGS (Audit Trail)
-- ==========================================
CREATE TABLE IF NOT EXISTS booking_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g., "created", "cancelled", "rescheduled"
  actor TEXT NOT NULL, -- "client", "admin", "system"
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_logs_booking ON booking_logs(booking_id);

-- ==========================================
-- COURSE REGISTRATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS course_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, waitlist
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, course_id)
);

-- ==========================================
-- BLOCKED SLOTS (vacation, etc.)
-- ==========================================
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  all_day BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocked_slots_date ON blocked_slots(date);

-- ==========================================
-- OPERATING HOURS
-- ==========================================
CREATE TABLE IF NOT EXISTS operating_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER UNIQUE NOT NULL, -- 0=Sunday, 6=Saturday
  open_time TEXT, -- null = closed
  close_time TEXT,
  active BOOLEAN DEFAULT true
);

-- ==========================================
-- SETTINGS (Key-Value Store)
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- GALLERY IMAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Services
INSERT INTO services (name, description, duration, price, sort_order) VALUES
  ('מניקור קלאסי', 'עיצוב, דחיפת עור ולכה', 45, 80, 1),
  ('מניקור ג׳ל', 'ציפורניים עמידות ומבריקות לשבועות', 60, 150, 2),
  ('בניית ציפורניים', 'בנייה מקצועית עם אקריל או ג׳ל בילדר', 90, 280, 3),
  ('עיצוב נייל ארט', 'עיצובים מותאמים אישית ואמנות על הציפורן', 30, 50, 4),
  ('פדיקור ספא', 'טיפול מפנק עם מסאז׳ והרגעת כפות הרגליים', 75, 180, 5),
  ('תיקון ציפורן', 'תיקון ציפורן שבורה או פגומה', 15, 30, 6);

-- Courses
INSERT INTO courses (name, description, date, duration, price, capacity) VALUES
  ('קורס מניקוריסטיות למתחילות', 'קורס מקיף ללימוד יסודות המניקור - מהבסיס ועד לקוחות ראשונות', '2025-01-15', '8 שעות', 1200, 8),
  ('סדנת נייל ארט מתקדם', 'טכניקות מתקדמות לעיצוב וציור על ציפורניים', '2025-01-22', '4 שעות', 650, 6),
  ('קורס בניית ציפורניים', 'לימוד בניית ציפורניים באקריל וג׳ל - מרמה בסיסית למתקדמת', '2025-02-05', '12 שעות', 1800, 6);

-- Operating Hours
INSERT INTO operating_hours (day_of_week, open_time, close_time, active) VALUES
  (0, '09:00', '20:00', true),  -- Sunday
  (1, '09:00', '20:00', true),  -- Monday
  (2, '09:00', '20:00', true),  -- Tuesday
  (3, '09:00', '20:00', true),  -- Wednesday
  (4, '09:00', '20:00', true),  -- Thursday
  (5, '09:00', '14:00', true),  -- Friday
  (6, NULL, NULL, false);       -- Saturday (closed)

-- Default Settings
INSERT INTO settings (key, value) VALUES
  ('cancel_hours_before', '24'),
  ('reschedule_hours_before', '24'),
  ('buffer_minutes', '15'),
  ('phone', '050-123-4567'),
  ('address', 'רחוב הרצל 50, תל אביב');

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations ENABLE ROW LEVEL SECURITY;

-- Public read access for services, courses, operating hours
CREATE POLICY "Public can view services" ON services FOR SELECT USING (active = true);
CREATE POLICY "Public can view courses" ON courses FOR SELECT USING (active = true);
CREATE POLICY "Public can view operating hours" ON operating_hours FOR SELECT USING (true);
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can view gallery" ON gallery_images FOR SELECT USING (active = true);

-- Clients can view their own data
CREATE POLICY "Users can view own client data" ON clients FOR SELECT USING (true);
CREATE POLICY "Users can insert client data" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own client data" ON clients FOR UPDATE USING (true);

-- Bookings policies
CREATE POLICY "Users can view bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Users can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update bookings" ON bookings FOR UPDATE USING (true);

-- Course registrations policies  
CREATE POLICY "Users can view registrations" ON course_registrations FOR SELECT USING (true);
CREATE POLICY "Users can insert registrations" ON course_registrations FOR INSERT WITH CHECK (true);

-- Booking logs (read only for clients)
CREATE POLICY "Users can view booking logs" ON booking_logs FOR SELECT USING (true);
CREATE POLICY "System can insert booking logs" ON booking_logs FOR INSERT WITH CHECK (true);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_course_registrations_updated_at BEFORE UPDATE ON course_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
