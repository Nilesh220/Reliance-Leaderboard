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

-- ── Seed All 57 POCs ─────────────────────────────────────────
INSERT INTO pocs (id, name, college, city) VALUES

  -- ── MUMBAI (25) ──────────────────────────────────────────
  ('mum_01', 'Aarav Mehta',      'Sydenham College of Commerce & Economics',    'Mumbai'),
  ('mum_02', 'Priya Sharma',     'HR College of Commerce & Economics',          'Mumbai'),
  ('mum_03', 'Rohan Patel',      'Jai Hind College',                            'Mumbai'),
  ('mum_04', 'Neha Joshi',       'NMIMS Mumbai',                                'Mumbai'),
  ('mum_05', 'Arjun Singh',      'KJ Somaiya College of Engineering',           'Mumbai'),
  ('mum_06', 'Kavya Iyer',       'VJTI Mumbai',                                 'Mumbai'),
  ('mum_07', 'Dev Kapoor',       'IIT Bombay',                                  'Mumbai'),
  ('mum_08', 'Anika Gupta',      'SP Jain School of Global Management',         'Mumbai'),
  ('mum_09', 'Siddharth Nair',   'Narsee Monjee College of Commerce',           'Mumbai'),
  ('mum_10', 'Riya Verma',       'Mithibai College of Arts',                    'Mumbai'),
  ('mum_11', 'Karan Malhotra',   'Wilson College Mumbai',                       'Mumbai'),
  ('mum_12', 'Pooja Tiwari',     'Sophia College for Women',                    'Mumbai'),
  ('mum_13', 'Aditya Kumar',     'St. Xavier''s College Mumbai',                'Mumbai'),
  ('mum_14', 'Shreya Pillai',    'Ramnarain Ruia Autonomous College',           'Mumbai'),
  ('mum_15', 'Vivek Rao',        'Bhavan''s College Mumbai',                    'Mumbai'),
  ('mum_16', 'Ananya Das',       'Rizvi College of Arts Science & Commerce',    'Mumbai'),
  ('mum_17', 'Rohit Shah',       'Podar College of Commerce & Economics',       'Mumbai'),
  ('mum_18', 'Meera Krishnan',   'VPM''s Polytechnic',                          'Mumbai'),
  ('mum_19', 'Shaan Chopra',     'KC College Mumbai',                           'Mumbai'),
  ('mum_20', 'Tanya Bose',       'LN College of Management & Technology',       'Mumbai'),
  ('mum_21', 'Yash Thakur',      'Thadomal Shahani Engineering College',        'Mumbai'),
  ('mum_22', 'Ishita Banerjee',  'DJ Sanghvi College of Engineering',           'Mumbai'),
  ('mum_23', 'Aakash Pandey',    'Universal AI University',                     'Mumbai'),
  ('mum_24', 'Disha Aggarwal',   'Atharva College of Engineering',              'Mumbai'),
  ('mum_25', 'Nikhil Shetty',    'SIES College of Arts Science & Commerce',     'Mumbai'),

  -- ── PUNE (25) ────────────────────────────────────────────
  ('pun_01', 'Manya Sharma',         'Symbiosis Centre of Business Management',         'Pune'),
  ('pun_02', 'Aman Kulkarni',        'Fergusson College Pune',                          'Pune'),
  ('pun_03', 'Siya Deshpande',       'MIT College of Engineering Pune',                 'Pune'),
  ('pun_04', 'Pratik Joshi',         'Savitribai Phule Pune University',                'Pune'),
  ('pun_05', 'Ayesha Khan',          'Symbiosis Institute of Business Management',      'Pune'),
  ('pun_06', 'Rahul Patil',          'College of Engineering Pune (COEP)',              'Pune'),
  ('pun_07', 'Divya More',           'Modern College of Arts Science & Commerce',       'Pune'),
  ('pun_08', 'Akshay Bhosale',       'FLAME University',                               'Pune'),
  ('pun_09', 'Sneha Pawar',          'Bharati Vidyapeeth University',                   'Pune'),
  ('pun_10', 'Omkar Kadam',          'Indira College of Commerce & Science',            'Pune'),
  ('pun_11', 'Prachi Jadhav',        'Deccan College Pune',                             'Pune'),
  ('pun_12', 'Tejas Shinde',         'MES Garware College of Commerce',                 'Pune'),
  ('pun_13', 'Ritika Deshmukh',      'Vishwakarma Institute of Technology',             'Pune'),
  ('pun_14', 'Kunal Wagh',           'MAEER''s MIT College Pune',                       'Pune'),
  ('pun_15', 'Anushka Kale',         'Dr. D.Y. Patil College of Engineering',           'Pune'),
  ('pun_16', 'Gaurav Salve',         'Sinhgad College of Engineering',                  'Pune'),
  ('pun_17', 'Nikita Gaikwad',       'Ajeenkya DY Patil University',                   'Pune'),
  ('pun_18', 'Varun Mane',           'PICT - Pune Institute of Computer Technology',    'Pune'),
  ('pun_19', 'Pallavi Sawant',       'Symbiosis College of Arts & Commerce',            'Pune'),
  ('pun_20', 'Harsh Chavan',         'Army Institute of Technology Pune',               'Pune'),
  ('pun_21', 'Komal Nimbalkar',      'Viman Nagar Education Society',                   'Pune'),
  ('pun_22', 'Siddhesh Suryavanshi', 'International Institute of Business Studies',     'Pune'),
  ('pun_23', 'Ruchi Thite',          'JSPM''s Rajarshi Shahu College of Engineering',   'Pune'),
  ('pun_24', 'Abhijeet Doke',        'Marathwada Mitra Mandal''s College',              'Pune'),
  ('pun_25', 'Shreeyash Zore',       'PVG''s College of Engineering Pune',              'Pune'),

  -- ── AURANGABAD (7) ───────────────────────────────────────
  ('aur_01', 'Sakshi Ingole',    'MGM University Aurangabad',                    'Aurangabad'),
  ('aur_02', 'Shubham Gaikwad', 'Deogiri College Aurangabad',                   'Aurangabad'),
  ('aur_03', 'Pooja Ansari',    'Dr. Rafiq Zakaria College for Women',           'Aurangabad'),
  ('aur_04', 'Amit Taur',       'MAEER''s MIT College Aurangabad',               'Aurangabad'),
  ('aur_05', 'Neha Muley',      'SBBS Institute of Engineering & Technology',    'Aurangabad'),
  ('aur_06', 'Ravi Kulkarni',   'Vidyavardhini''s College of Engineering',       'Aurangabad'),
  ('aur_07', 'Priyanka Shelar', 'Government College of Engineering Aurangabad',  'Aurangabad')

ON CONFLICT (id) DO NOTHING;
