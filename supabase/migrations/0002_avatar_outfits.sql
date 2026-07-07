-- StudyBee: saved avatar "outfits" — named snapshots of a user's avatar
-- slots (color, and hat/accessory once a cosmetics catalog exists) that they
-- can switch between with one click, without losing a look they liked.

create table if not exists public.avatar_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  slots jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.avatar_outfits enable row level security;

drop policy if exists "Users can view their own outfits" on public.avatar_outfits;
create policy "Users can view their own outfits"
  on public.avatar_outfits for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own outfits" on public.avatar_outfits;
create policy "Users can insert their own outfits"
  on public.avatar_outfits for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own outfits" on public.avatar_outfits;
create policy "Users can delete their own outfits"
  on public.avatar_outfits for delete
  using (auth.uid() = user_id);

create index if not exists avatar_outfits_user_id_idx on public.avatar_outfits (user_id);
