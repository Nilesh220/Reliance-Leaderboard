-- ============================================================
-- BOOTUP INDIA × RELIANCE DIGITAL
-- Story Submissions Table — Valorant Challenge
-- Run this block in your Supabase SQL Editor
-- ============================================================

-- 1. Story Submissions Table
CREATE TABLE IF NOT EXISTS story_submissions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (resolved from registrations by email, or entered manually)
  email                TEXT NOT NULL,
  full_name            TEXT NOT NULL,
  mobile               TEXT,

  -- Referral tracking (which POC's link they came from)
  referral_poc_id      TEXT,        -- e.g. 'mum_01'
  referral_poc_name    TEXT,        -- denormalized display name

  -- Submission 1: Instagram story screenshot (day-of)
  story_url            TEXT,        -- Cloudinary URL
  story_caption        TEXT,        -- optional caption they added
  story_submitted_at   TIMESTAMPTZ,

  -- Submission 2: Story views screenshot (next day)
  views_url            TEXT,        -- Cloudinary URL
  views_count          INTEGER,     -- self-reported view count from screenshot
  views_submitted_at   TIMESTAMPTZ,

  -- Admin tracking
  status               TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'story_submitted', 'views_submitted', 'verified', 'rejected')),
  admin_note           TEXT DEFAULT '',

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Unique constraint: one submission flow per email
CREATE UNIQUE INDEX IF NOT EXISTS story_submissions_email_unique
  ON story_submissions (email);

-- 3. Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_story_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_story_submissions_updated_at
  BEFORE UPDATE ON story_submissions
  FOR EACH ROW EXECUTE FUNCTION trigger_story_set_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE story_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy (anon key — public read/write for submissions)
CREATE POLICY "Allow all on story_submissions"
  ON story_submissions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Enable Realtime (live admin view)
ALTER PUBLICATION supabase_realtime ADD TABLE story_submissions;
