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
-- 3. Add sms_sender setting (optional)
-- ============================================
-- Insert sms_sender setting if you want different sender name
-- Replace 'YourSenderName' with your SMS4Free verified sender
INSERT INTO settings (key, value) 
VALUES ('sms_sender', 'YourSenderName')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 4. Add hero/about settings (if not exists)
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
-- Done! Check results:
-- ============================================
SELECT * FROM settings ORDER BY key;
SELECT * FROM alive;
