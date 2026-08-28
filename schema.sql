-- VANTA AI — Database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  plan text not null default 'free' check (plan in ('free', 'creator', 'pro', 'agency')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- projects
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  niche text not null default '',
  platform text not null default 'YouTube',
  target_audience text not null default '',
  tone text not null default 'Professional',
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on projects(user_id);

alter table projects enable row level security;

create policy "projects_select_own" on projects
  for select using (auth.uid() = user_id);
create policy "projects_insert_own" on projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on projects
  for update using (auth.uid() = user_id);
create policy "projects_delete_own" on projects
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- content_ideas
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists content_ideas (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  hook text not null default '',
  angle text not null default '',
  score int not null default 0 check (score between 0 and 100),
  status text not null default 'Idea' check (status in ('Idea', 'Writing', 'Ready', 'Scheduled', 'Published')),
  created_at timestamptz not null default now()
);

create index if not exists content_ideas_project_id_idx on content_ideas(project_id);

alter table content_ideas enable row level security;

create policy "content_ideas_select_own" on content_ideas
  for select using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "content_ideas_insert_own" on content_ideas
  for insert with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "content_ideas_update_own" on content_ideas
  for update using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "content_ideas_delete_own" on content_ideas
  for delete using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- scripts
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  idea_id uuid references content_ideas(id) on delete set null,
  title text not null default '',
  hook text not null default '',
  body text not null default '',
  cta text not null default '',
  duration text not null default '30 seconds',
  created_at timestamptz not null default now()
);

create index if not exists scripts_project_id_idx on scripts(project_id);
create index if not exists scripts_idea_id_idx on scripts(idea_id);

alter table scripts enable row level security;

create policy "scripts_select_own" on scripts
  for select using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "scripts_insert_own" on scripts
  for insert with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "scripts_update_own" on scripts
  for update using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "scripts_delete_own" on scripts
  for delete using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- content_calendar
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  script_id uuid references scripts(id) on delete set null,
  scheduled_date timestamptz not null,
  status text not null default 'Idea' check (status in ('Idea', 'Writing', 'Ready', 'Scheduled', 'Published')),
  platform text not null default 'YouTube'
);

create index if not exists content_calendar_project_id_idx on content_calendar(project_id);
create index if not exists content_calendar_scheduled_date_idx on content_calendar(scheduled_date);

alter table content_calendar enable row level security;

create policy "content_calendar_select_own" on content_calendar
  for select using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "content_calendar_insert_own" on content_calendar
  for insert with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "content_calendar_update_own" on content_calendar
  for update using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "content_calendar_delete_own" on content_calendar
  for delete using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- analytics  (user-entered performance numbers only — never scraped/invented)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  content_id uuid references content_calendar(id) on delete set null,
  views bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  shares bigint not null default 0,
  watch_time numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists analytics_project_id_idx on analytics(project_id);

alter table analytics enable row level security;

create policy "analytics_select_own" on analytics
  for select using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "analytics_insert_own" on analytics
  for insert with check (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "analytics_update_own" on analytics
  for update using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "analytics_delete_own" on analytics
  for delete using (exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────
-- usage_log  (for future plan-limit enforcement — logging only for now)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

create index if not exists usage_log_user_id_created_at_idx on usage_log(user_id, created_at);

alter table usage_log enable row level security;

create policy "usage_log_select_own" on usage_log
  for select using (auth.uid() = user_id);
-- Inserts happen from Edge Functions using the user's own JWT via requireUser(),
-- so the same "insert own" policy applies there too.
create policy "usage_log_insert_own" on usage_log
  for insert with check (auth.uid() = user_id);
