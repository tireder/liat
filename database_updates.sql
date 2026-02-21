-- Liart Database Updates
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Keep-alive table for cron job
-- ============================================
CREATE TABLE IF NOT EXISTS alive (
    id INTEGER PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    log TEXT
);

-- ============================================
-- 2. Add reminder_sent column to bookings
-- ============================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_sent TIMESTAMPTZ;

-- ============================================
-- 3. Settings: Business name vs SMS Sender
-- ============================================
-- business_name = Displayed in messages, website, calendar
-- sms_sender = Only for SMS4Free API sender field

-- Update these with your actual values:
INSERT INTO settings (key, value) VALUES 
    ('business_name', 'ליאת'),  -- Hebrew name shown in messages
    ('sms_sender', 'Liat')      -- SMS4Free verified sender (English)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- 4. Hero/About settings
-- ============================================
INSERT INTO settings (key, value) VALUES 
    ('hero_title', 'יופי בקצות האצבעות'),
    ('hero_subtitle', 'טיפולי ציפורניים מקצועיים בסביבה אינטימית ומפנקת. כל ביקור הוא חוויה.'),
    ('about_name', 'ליאת'),
    ('about_text', 'מזה למעלה מ-8 שנים אני עוסקת באמנות הציפורניים מתוך אהבה אמיתית למקצוע.'),
    ('about_years', '8'),
    ('about_clients', '500'),
    ('about_graduates', '50')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Verify settings:
-- ============================================
SELECT * FROM settings ORDER BY key;

-- ============================================
-- 5. Push Notification Tokens
-- ============================================
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_tokens_unique 
    ON push_tokens(client_id, token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_client 
    ON push_tokens(client_id) WHERE active = true;

-- Add trigger for updated_at
CREATE TRIGGER update_push_tokens_updated_at 
    BEFORE UPDATE ON push_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. App notification preference on clients
-- ============================================
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS app_notifications_enabled BOOLEAN DEFAULT false;

-- ============================================
-- 7. Notifications log table (in-app notification history)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'APPOINTMENT_CREATED', 'APPOINTMENT_UPDATED', 'APPOINTMENT_CANCELED', 'REVIEW_REQUEST'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB, -- extra payload (booking_id, deep_link, etc.)
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_client 
    ON notifications(client_id, sent_at DESC);

-- RLS for push_tokens and notifications
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage push tokens" ON push_tokens FOR ALL USING (true);
CREATE POLICY "Users can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notifications" ON notifications FOR UPDATE USING (true);

-- ============================================
-- 8. Add review_token to bookings if missing
-- ============================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS review_token TEXT;

-- ============================================
-- 9. Add artist_id to bookings if missing
-- ============================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES nail_artists(id);

-- ============================================
-- 10. Reviews table if missing
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    public BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);

-- ============================================
-- 11. Nail artists table if missing
-- ============================================
CREATE TABLE IF NOT EXISTS nail_artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_services (
    artist_id UUID NOT NULL REFERENCES nail_artists(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (artist_id, service_id)
);

-- ============================================
-- 12. Reminder logs table if missing
-- ============================================
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add reminder_days to services if missing
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS reminder_days INTEGER;
