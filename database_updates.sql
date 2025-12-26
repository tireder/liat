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
