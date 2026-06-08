-- ============================================================
-- BOOTUP INDIA CAMPAIGN — SUPABASE SCHEMA
-- Run this entire block in your Supabase SQL Editor
-- ============================================================

-- 1. POCs Table
CREATE TABLE IF NOT EXISTS pocs (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  college     TEXT NOT NULL,
  city        TEXT NOT NULL CHECK (city IN ('Mumbai', 'Pune', 'Aurangabad')),
  points      INTEGER NOT NULL DEFAULT 0,
  task_log    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Pending Queue Table
CREATE TABLE IF NOT EXISTS pending_queue (
  id            TEXT PRIMARY KEY,
  poc_id        TEXT NOT NULL,
  poc_name      TEXT NOT NULL,
  college       TEXT NOT NULL,
  city          TEXT NOT NULL,
  task_id       TEXT NOT NULL,
  task_name     TEXT NOT NULL,
  task_icon     TEXT NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  points_earned INTEGER NOT NULL,
  note          TEXT DEFAULT '',
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id            TEXT PRIMARY KEY,
  poc_id        TEXT,
  poc_name      TEXT,
  college       TEXT,
  city          TEXT,
  task_id       TEXT,
  task_name     TEXT,
  task_icon     TEXT,
  quantity      INTEGER DEFAULT 1,
  points_earned INTEGER,
  note          TEXT DEFAULT '',
  status        TEXT DEFAULT 'published',
  added_at      TIMESTAMPTZ,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Campaign Meta Table
CREATE TABLE IF NOT EXISTS campaign_meta (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Auto-update trigger for updated_at ──────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pocs_updated_at
  BEFORE UPDATE ON pocs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── Enable Row Level Security ────────────────────────────────
ALTER TABLE pocs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_meta ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies (anon key — no login required) ──────────────
CREATE POLICY "Allow all on pocs"          ON pocs          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pending_queue" ON pending_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_log"     ON audit_log     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on campaign_meta" ON campaign_meta FOR ALL USING (true) WITH CHECK (true);

-- ── Enable Realtime (for live leaderboard updates) ───────────
ALTER PUBLICATION supabase_realtime ADD TABLE pocs;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_meta;

-- ── Seed Campaign Meta ───────────────────────────────────────
INSERT INTO campaign_meta (key, value) VALUES
  ('last_published', NULL),
  ('last_updated',   NULL)
ON CONFLICT (key) DO NOTHING;

-- ── Seed All 48 POCs ─────────────────────────────────────────
INSERT INTO pocs (id, name, college, city) VALUES

  -- ── MUMBAI (17) ──────────────────────────────────────────
  ('mum_01', 'Alshifa Shaikh', 'RD & SH National College, Bandra', 'Mumbai'),
  ('mum_02', 'Siddhant Rangole', 'St. Francis Institute of Technology', 'Mumbai'),
  ('mum_03', 'Harsh Gupta', 'Lala Lajpat Rai College', 'Mumbai'),
  ('mum_04', 'Sakshi Bhoite', 'Vivekanand Education Society College of Arts, Science and Commerce', 'Mumbai'),
  ('mum_05', 'Dakshita Sandip Chawla', 'SIES College (Sion West)', 'Mumbai'),
  ('mum_06', 'Dhruv Jitendra Pathare', 'Keraleeya Samajam Model College', 'Mumbai'),
  ('mum_07', 'Kushal Rajesh Dubey', 'Lokmanya Tilak College of Engineering', 'Mumbai'),
  ('mum_08', 'Darsh Bhoir', 'Datta Meghe College of Engineering', 'Mumbai'),
  ('mum_09', 'Radhey Wandhekar', 'VJTI Mumbai', 'Mumbai'),
  ('mum_10', 'Piyush Rajesh Gupta', 'Vidyalankar Institute of Technology', 'Mumbai'),
  ('mum_11', 'Yajat Yadav', 'Smt. Mithibai Motiram Kundnani College', 'Mumbai'),
  ('mum_12', 'Aditya Vagare', 'Terna Engineering College', 'Mumbai'),
  ('mum_13', 'Archita Dakua', 'AC Patil College of Engineering', 'Mumbai'),
  ('mum_14', 'Tarun Khatri', 'Pillai College of Arts Commerce Science', 'Mumbai'),
  ('mum_15', 'Yashashvi Agarwal', 'ICT Mumbai', 'Mumbai'),
  ('mum_16', 'Vedant Kanekar', 'Fr. Conceicao Rodrigues College of Engineering', 'Mumbai'),
  ('mum_17', 'Archit Santosh Vishwakarma', 'Western College of Commerce', 'Mumbai'),

  -- ── PUNE (25) ────────────────────────────────────────────
  ('pun_01', 'Shivraj Shirsikar', 'Ajeenkya DY Patil University', 'Pune'),
  ('pun_02', 'Nikita', 'PCET''s Nutan Maharashtra Institute of Engineering and Technology', 'Pune'),
  ('pun_03', 'Dhruv Kapoor', 'SCMS (Symbiosis Centre for Management Studies)', 'Pune'),
  ('pun_04', 'Veer Batra', 'MIT WPU', 'Pune'),
  ('pun_05', 'Hariom Pralhad Sandve', 'TSSM''s PVPIT Pune', 'Pune'),
  ('pun_06', 'Lavesh', 'Marathwada Mitra Mandal''s College of Engineering (MMCOE)', 'Pune'),
  ('pun_07', 'Bhuumi Jakhotia', 'BMCC', 'Pune'),
  ('pun_08', 'Sumeet Yadav', 'Dr. D. Y. Patil Vidyapeeth, Pimpri, Pune', 'Pune'),
  ('pun_09', 'Yuvraj Vivek Ligade', 'PCCOE (Pimpri Chinchwad College of Engineering)', 'Pune'),
  ('pun_10', 'Krishna Kadu', 'D.Y. Patil Dnyaan Prasad Global University (DPGU)', 'Pune'),
  ('pun_11', 'Yashjeet K Makhija', 'Symbiosis Skills and Professional University', 'Pune'),
  ('pun_12', 'Junaid Mubin Ali Kassar', 'Poona College of Commerce, Arts and Sciences', 'Pune'),
  ('pun_13', 'Siddhi Avinash Shelke', 'MIT ADT University', 'Pune'),
  ('pun_14', 'Smit Gondole', 'Sinhgad College of Engineering (SCOE)', 'Pune'),
  ('pun_15', 'Bhumikumari Singh', 'SKNCOE', 'Pune'),
  ('pun_16', 'Shweta Show', 'Ness Wadia College of Commerce', 'Pune'),
  ('pun_17', 'Samrudhi Tushar Chavan', 'Alard University', 'Pune'),
  ('pun_18', 'Ninad Sanjay Ghogare', 'Savitribai Phule Pune University', 'Pune'),
  ('pun_19', 'Dhruv Nile', 'JSPM''s RSCOE Ashok Nagar, Tathawade', 'Pune'),
  ('pun_20', 'Prajwal Ghagre', 'Sri Balaji University, Pune', 'Pune'),
  ('pun_21', 'Sarangi Kamargaonkar', 'Dhole Patil College of Engineering (DPCOE)', 'Pune'),
  ('pun_22', 'Manya Jain', 'Symbiosis Institute of Management Studies', 'Pune'),
  ('pun_23', 'Ved Yogesh Batra', 'Vishwakarma Institute of Technology', 'Pune'),
  ('pun_24', 'Ayush Kumar', 'Bharati Vidyapeeth College of Engineering Pune', 'Pune'),
  ('pun_25', 'Pranav Sonawane', 'PGMCOE', 'Pune'),

  -- ── AURANGABAD (6) ───────────────────────────────────────
  ('aur_01', 'Bhakti Dhage', 'MGM''s Jawaharlal Nehru Engineering College', 'Aurangabad'),
  ('aur_02', 'Jayraj Huse', 'Government College of Engineering', 'Aurangabad'),
  ('aur_03', 'Ved Thakur', 'Aasawa Brothers Commerce Junior College & Senior College', 'Aurangabad'),
  ('aur_04', 'Diksha Sanjay Bhagat', 'PES College of Engineering', 'Aurangabad'),
  ('aur_05', 'Sanchita Shelar', 'Shreeyash Polytechnic', 'Aurangabad'),
  ('aur_06', 'Pritam Dilip Teltumbade', 'MIT College', 'Aurangabad')

ON CONFLICT (id) DO NOTHING;

