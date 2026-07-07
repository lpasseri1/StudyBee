-- StudyBee: per-user tables backing avatar cosmetics, credits, and Focus
-- Study sessions. All tables key off auth.users.id and are locked down with
-- Row Level Security so a user can only ever read/write their own row.

-- === Avatars ================================================================
-- One row per user. `slots` holds the customization framework described in
-- Feature #2 — hat / accessory / color — as a jsonb blob so new slot types
-- can be added later without a migration. Cosmetics catalog/inventory is a
-- future pass; for now this just stores which cosmetic id (if any) occupies
-- each slot.
create table if not exists public.avatars (
  user_id uuid primary key references auth.users (id) on delete cascade,
  base_sprite text not null default 'bee-classic',
  slots jsonb not null default '{"hat": null, "accessory": null, "color": "amber"}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.avatars enable row level security;

drop policy if exists "Users can view their own avatar" on public.avatars;
create policy "Users can view their own avatar"
  on public.avatars for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own avatar" on public.avatars;
create policy "Users can insert their own avatar"
  on public.avatars for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own avatar" on public.avatars;
create policy "Users can update their own avatar"
  on public.avatars for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- === Credits =================================================================
-- One row per user holding their running balance. Earning/spending happens
-- through the SQL functions below rather than direct client writes, so the
-- balance can't go negative or be edited outside the intended flows.
create table if not exists public.credits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_earned integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.credits enable row level security;

drop policy if exists "Users can view their own credit balance" on public.credits;
create policy "Users can view their own credit balance"
  on public.credits for select
  using (auth.uid() = user_id);

-- No insert/update policy for credits: rows are created/mutated only via the
-- security-definer functions below, called as the authenticated user.

create or replace function public.earn_credits(amount integer)
returns public.credits
language plpgsql
security definer set search_path = public
as $$
declare
  result public.credits;
begin
  if amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  insert into public.credits (user_id, balance, lifetime_earned)
  values (auth.uid(), amount, amount)
  on conflict (user_id) do update
    set balance = credits.balance + excluded.balance,
        lifetime_earned = credits.lifetime_earned + excluded.balance,
        updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.spend_credits(amount integer)
returns public.credits
language plpgsql
security definer set search_path = public
as $$
declare
  result public.credits;
begin
  if amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  update public.credits
    set balance = balance - amount,
        updated_at = now()
    where user_id = auth.uid() and balance >= amount
  returning * into result;

  if result is null then
    raise exception 'insufficient credits';
  end if;

  return result;
end;
$$;

grant execute on function public.earn_credits(integer) to authenticated;
grant execute on function public.spend_credits(integer) to authenticated;

-- === Focus study sessions ===================================================
-- One row per session, used to compute "Total hours studied" and to award
-- credits every 10 minutes of active study time.
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  planned_minutes integer not null check (planned_minutes > 0 and planned_minutes <= 120),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  active_seconds integer not null default 0,
  credits_earned integer not null default 0
);

alter table public.focus_sessions enable row level security;

drop policy if exists "Users can view their own focus sessions" on public.focus_sessions;
create policy "Users can view their own focus sessions"
  on public.focus_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own focus sessions" on public.focus_sessions;
create policy "Users can insert their own focus sessions"
  on public.focus_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own focus sessions" on public.focus_sessions;
create policy "Users can update their own focus sessions"
  on public.focus_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists focus_sessions_user_id_idx on public.focus_sessions (user_id);
