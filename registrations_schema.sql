-- ============================================================
-- BOOTUP INDIA × RELIANCE DIGITAL
-- Valorant Store-Visit Registration Table
-- Run this block in your Supabase SQL Editor
-- ============================================================

-- 1. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poc_id            TEXT NOT NULL,
  poc_name          TEXT NOT NULL,

  -- Student fields
  full_name         TEXT NOT NULL,
  mobile            TEXT NOT NULL,
  email             TEXT NOT NULL,
  college_name      TEXT NOT NULL,
  college_city      TEXT NOT NULL,
  preferred_store   TEXT NOT NULL,
  valorant_username TEXT NOT NULL,
  current_rank      TEXT NOT NULL CHECK (current_rank IN (
    'Unranked','Iron','Bronze','Silver','Gold','Platinum',
    'Diamond','Ascendant','Immortal','Radiant'
  )),

  registered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Unique constraint: one registration per mobile number
CREATE UNIQUE INDEX IF NOT EXISTS registrations_mobile_unique
  ON registrations (mobile);

-- 3. Unique constraint: one registration per email
CREATE UNIQUE INDEX IF NOT EXISTS registrations_email_unique
  ON registrations (email);

-- 4. Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy (anon key — no login required for inserts/reads)
CREATE POLICY "Allow all on registrations"
  ON registrations FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Enable Realtime (optional — for live admin view)
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
