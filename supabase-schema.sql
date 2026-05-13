-- NourishPlan V2 — Supabase Postgres Schema
-- Run this in Supabase SQL Editor to create all required tables.

-- ─── Profiles (user preferences + active plan state) ────────────────

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_preferences jsonb not null default '{}',
  active_plan jsonb not null default '{"daily": null, "weekly": null}',
  plan_view_mode text not null default 'day',
  prefer_favorites boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);


-- ─── Saved Plans ────────────────────────────────────────────────────

create table if not exists saved_plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tags jsonb not null default '[]',
  notes text not null default '',
  type text not null default 'daily', -- 'daily' | 'weekly'
  plan_data jsonb not null default '{}',
  prefs jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_saved_plans_user on saved_plans(user_id);

alter table saved_plans enable row level security;

create policy "Users can read own plans"
  on saved_plans for select using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on saved_plans for insert with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on saved_plans for update using (auth.uid() = user_id);

create policy "Users can delete own plans"
  on saved_plans for delete using (auth.uid() = user_id);


-- ─── Favorites ──────────────────────────────────────────────────────

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id text not null,
  primary key (user_id, meal_id)
);

alter table favorites enable row level security;

create policy "Users can read own favorites"
  on favorites for select using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on favorites for delete using (auth.uid() = user_id);


-- ─── Custom Foods ───────────────────────────────────────────────────

create table if not exists custom_foods (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  food jsonb not null
);

create index if not exists idx_custom_foods_user on custom_foods(user_id);

alter table custom_foods enable row level security;

create policy "Users can read own custom foods"
  on custom_foods for select using (auth.uid() = user_id);

create policy "Users can insert own custom foods"
  on custom_foods for insert with check (auth.uid() = user_id);

create policy "Users can delete own custom foods"
  on custom_foods for delete using (auth.uid() = user_id);


-- ─── Saved Shakes ───────────────────────────────────────────────────

create table if not exists saved_shakes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  shake jsonb not null
);

create index if not exists idx_saved_shakes_user on saved_shakes(user_id);

alter table saved_shakes enable row level security;

create policy "Users can read own shakes"
  on saved_shakes for select using (auth.uid() = user_id);

create policy "Users can insert own shakes"
  on saved_shakes for insert with check (auth.uid() = user_id);

create policy "Users can delete own shakes"
  on saved_shakes for delete using (auth.uid() = user_id);
