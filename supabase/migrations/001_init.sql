-- ======================================================
-- JanSamadhan+ -- Database Schema & RLS Policies
-- Run this in Supabase SQL Editor
-- ======================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ======================================================
-- 1. Complaints Table
-- ======================================================
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text not null check (length(description) > 5),
  attachments jsonb default '[]'::jsonb,
  status text not null default 'no_action' check (status in ('no_action', 'working', 'solved')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  last_admin_note text,
  visible boolean default true not null
);

-- Index for common queries
create index if not exists idx_complaints_status on public.complaints(status);
create index if not exists idx_complaints_created_at on public.complaints(created_at desc);
create index if not exists idx_complaints_visible on public.complaints(visible);

-- ======================================================
-- 2. Complaint History (Audit Log) Table
-- ======================================================
create table if not exists public.complaint_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  action text not null check (action in ('created', 'status_changed', 'note_added', 'deleted')),
  from_status text,
  to_status text,
  note text,
  admin_id text,
  created_at timestamptz default now() not null
);

create index if not exists idx_history_complaint_id on public.complaint_history(complaint_id);
create index if not exists idx_history_created_at on public.complaint_history(created_at desc);

-- ======================================================
-- 3. Admin Users Table (for role tracking)
-- ======================================================
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz default now() not null
);

-- ======================================================
-- 4. Row Level Security (RLS)
-- ======================================================

-- Enable RLS on all tables
alter table public.complaints enable row level security;
alter table public.complaint_history enable row level security;
alter table public.admin_users enable row level security;

-- -- Complaints Policies --

-- Anyone can read visible complaints
create policy "Public can read visible complaints"
  on public.complaints for select
  using (visible = true);

-- Admins can read all complaints (including hidden)
create policy "Admins can read all complaints"
  on public.complaints for select
  using (
    auth.uid() in (select id from public.admin_users)
  );

-- Anyone can insert complaints (anonymous)
create policy "Anyone can create complaints"
  on public.complaints for insert
  with check (
    status = 'no_action'
    and visible = true
    and last_admin_note is null
  );

-- Only admins can update complaints
-- Enforces: status change to working/solved requires last_admin_note
create policy "Admins can update complaints"
  on public.complaints for update
  using (
    auth.uid() in (select id from public.admin_users)
  )
  with check (
    auth.uid() in (select id from public.admin_users)
    and (
      -- If status stays the same, allow
      (status = (select c.status from public.complaints c where c.id = complaints.id))
      or
      -- If status changes, validate
      (
        status in ('no_action', 'working', 'solved')
        and (
          status = 'no_action'
          or (last_admin_note is not null and length(last_admin_note) > 0)
        )
      )
    )
  );

-- Only admins can delete (soft delete via visible=false)
create policy "Admins can delete complaints"
  on public.complaints for delete
  using (
    auth.uid() in (select id from public.admin_users)
  );

-- -- History Policies --

-- Anyone can read history
create policy "Public can read complaint history"
  on public.complaint_history for select
  using (true);

-- Only admins can insert history
create policy "Admins can create history entries"
  on public.complaint_history for insert
  with check (
    auth.uid() in (select id from public.admin_users)
  );

-- No updates or deletes on history (immutable audit log)
-- (No policies needed — default deny)

-- -- Admin Users Policies --

-- Only admins can read admin list
create policy "Admins can read admin users"
  on public.admin_users for select
  using (
    auth.uid() = id
  );

-- ======================================================
-- 5. Enable Realtime on complaints table
-- ======================================================
alter publication supabase_realtime add table public.complaints;

-- ======================================================
-- 6. Updated_at trigger
-- ======================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_complaint_updated
  before update on public.complaints
  for each row
  execute function public.handle_updated_at();

-- ======================================================
-- 7. Constraint: working/solved requires last_admin_note
-- (Belt-and-suspenders with RLS above)
-- ======================================================
create or replace function public.enforce_admin_note()
returns trigger as $$
begin
  if new.status in ('working', 'solved') and (new.last_admin_note is null or length(trim(new.last_admin_note)) = 0) then
    raise exception 'Admin note is required when setting status to working or solved';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_admin_note_trigger
  before update on public.complaints
  for each row
  when (old.status is distinct from new.status)
  execute function public.enforce_admin_note();
