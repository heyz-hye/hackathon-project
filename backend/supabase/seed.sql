-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Creates users + budget_history with a one-to-many relationship and monthly uniqueness per user.

-- App-owned user accounts (passwords are hashed by the Node API, never stored in plain text).
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

-- One row per calendar month per user; updating the same month overwrites that row.
create table if not exists public.budget_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  year_month date not null,
  monthly_income numeric(14, 2) not null default 0,
  rent numeric(14, 2) not null default 0,
  food numeric(14, 2) not null default 0,
  transport numeric(14, 2) not null default 0,
  misc numeric(14, 2) not null default 0,
  uploaded_at timestamptz not null default now(),
  constraint budget_history_year_month_first_day check (extract(day from year_month) = 1),
  constraint budget_history_user_month_unique unique (user_id, year_month)
);

create index if not exists budget_history_user_month_idx
  on public.budget_history (user_id, year_month desc);

-- Seed: no rows by default (users register via the app). Uncomment to insert demo data after you have a user id:
-- insert into public.budget_history (user_id, year_month, monthly_income, rent, food, transport, misc)
-- values ('00000000-0000-0000-0000-000000000000', date '2026-03-01', 2400, 1200, 350, 127, 200);
