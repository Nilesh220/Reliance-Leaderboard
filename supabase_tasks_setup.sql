-- ═══════════════════════════════════════════════════
-- Bootup India — Auth + Task Submission Tables
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Login OTPs table
create table if not exists login_otps (
  id         bigserial primary key,
  email      text not null,
  otp        text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

-- Auto-cleanup: delete old OTPs on insert
create or replace function cleanup_old_otps()
returns trigger language plpgsql as $$
begin
  delete from login_otps where expires_at < now() - interval '1 hour';
  return new;
end;
$$;

drop trigger if exists trg_cleanup_otps on login_otps;
create trigger trg_cleanup_otps after insert on login_otps
  for each statement execute function cleanup_old_otps();

-- Tasks table (created by admin)
create table if not exists tasks (
  id          bigserial primary key,
  title       text not null,
  description text,
  task_type   text not null check (task_type in ('story_screenshot','store_visit','reel_link')),
  points      int  not null default 50,
  deadline    timestamptz,
  is_live     boolean default false,
  created_at  timestamptz default now()
);

-- Task submissions (by POCs)
create table if not exists task_submissions (
  id           bigserial primary key,
  poc_id       text not null,
  task_id      bigint references tasks(id) on delete cascade,
  media_url    text,
  reel_link    text,
  notes        text,
  status       text default 'pending' check (status in ('pending','approved','rejected')),
  admin_note   text,
  submitted_at timestamptz default now()
);

-- RLS Policies
alter table login_otps      enable row level security;
alter table tasks            enable row level security;
alter table task_submissions enable row level security;

-- Allow anon to insert/read login_otps (OTP flow happens via serverless)
create policy "anon_all_login_otps" on login_otps for all using (true) with check (true);

-- Allow anon full access to tasks (since admin writes happen client-side)
create policy "anon_all_tasks" on tasks for all using (true) with check (true);

-- Allow anon to insert/read/update task_submissions
create policy "anon_all_submissions" on task_submissions for all using (true) with check (true);

-- Allow service role full access to tasks (for admin writes)
-- (service role bypasses RLS by default)
