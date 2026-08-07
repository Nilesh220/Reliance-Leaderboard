-- ============================================================
-- BOOTUP INDIA × RELIANCE DIGITAL
-- Store Walk-in Registrations (Aug 10–14, 2026)
-- Run this block in your Supabase SQL Editor
-- ============================================================

-- 1. Walk-in Registrations Table
CREATE TABLE IF NOT EXISTS walkin_registrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- POC who referred this student
  poc_id                TEXT NOT NULL,
  poc_name              TEXT NOT NULL,

  -- Student fields
  full_name             TEXT NOT NULL,
  mobile                TEXT NOT NULL,
  email                 TEXT NOT NULL,
  college_name          TEXT NOT NULL,
  college_city          TEXT NOT NULL,

  -- Store & visit
  preferred_store       TEXT NOT NULL,
  store_location        TEXT NOT NULL DEFAULT '',
  visit_date            DATE NOT NULL,

  -- Email pipeline tracking
  confirmation_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent         BOOLEAN NOT NULL DEFAULT FALSE,
  followup_sent         BOOLEAN NOT NULL DEFAULT FALSE,
  poc_alert_sent        BOOLEAN NOT NULL DEFAULT FALSE,

  -- Story screenshot tracking
  story_screenshot_url  TEXT,
  story_submitted_at    TIMESTAMPTZ,
  story_status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (story_status IN (
                          'pending',
                          'submitted',
                          'verified',
                          'rejected'
                        )),

  -- Admin note
  admin_note            TEXT DEFAULT '',

  -- Timestamps
  registered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS walkin_registrations_mobile_unique
  ON walkin_registrations (mobile);

CREATE UNIQUE INDEX IF NOT EXISTS walkin_registrations_email_unique
  ON walkin_registrations (email);

-- 3. Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_walkin_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_walkin_registrations_updated_at ON walkin_registrations;
CREATE TRIGGER set_walkin_registrations_updated_at
  BEFORE UPDATE ON walkin_registrations
  FOR EACH ROW EXECUTE FUNCTION trigger_walkin_set_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE walkin_registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy (anon key — public read/write)
DROP POLICY IF EXISTS "Allow all on walkin_registrations" ON walkin_registrations;
CREATE POLICY "Allow all on walkin_registrations"
  ON walkin_registrations FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Enable Realtime (live admin view)
ALTER PUBLICATION supabase_realtime ADD TABLE walkin_registrations;
