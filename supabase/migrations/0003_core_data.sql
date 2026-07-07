-- StudyBee: core app content, migrated from browser localStorage to Supabase
-- so it follows a user across devices instead of being stuck in one browser.
-- Same RLS pattern as avatars/credits/focus_sessions/avatar_outfits: every
-- row is scoped to auth.uid() = user_id.

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  teacher text not null default '',
  room text not null default '',
  color text not null check (color in ('violet','blue','emerald','amber','rose','cyan','orange','pink')),
  created_at timestamptz not null default now()
);

alter table public.classes enable row level security;

drop policy if exists "Users manage their own classes" on public.classes;
create policy "Users manage their own classes"
  on public.classes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists classes_user_id_idx on public.classes (user_id);

-- === Schedule events =========================================================
create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  class_id uuid references public.classes (id) on delete cascade,
  day text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  start_time text not null,
  end_time text not null,
  location text not null default '',
  type text not null check (type in ('class','club','sport','meeting','event')),
  bring_items text[],
  created_at timestamptz not null default now()
);

alter table public.schedule_events enable row level security;

drop policy if exists "Users manage their own schedule events" on public.schedule_events;
create policy "Users manage their own schedule events"
  on public.schedule_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists schedule_events_user_id_idx on public.schedule_events (user_id);
create index if not exists schedule_events_class_id_idx on public.schedule_events (class_id);

-- === Grades ===================================================================
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null,
  type text not null check (type in ('test','quiz','homework','project')),
  score numeric not null,
  max_score numeric not null,
  date text not null,
  created_at timestamptz not null default now()
);

alter table public.grades enable row level security;

drop policy if exists "Users manage their own grades" on public.grades;
create policy "Users manage their own grades"
  on public.grades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists grades_user_id_idx on public.grades (user_id);
create index if not exists grades_class_id_idx on public.grades (class_id);

-- === Notes ====================================================================
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  unit text not null default '',
  title text not null,
  content text not null default '',
  updated_at text not null,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

drop policy if exists "Users manage their own notes" on public.notes;
create policy "Users manage their own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_class_id_idx on public.notes (class_id);

-- === Tasks ====================================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  class_id uuid references public.classes (id) on delete set null,
  type text not null check (type in ('homework','study','assignment','reminder')),
  due_date text not null,
  done boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "Users manage their own tasks" on public.tasks;
create policy "Users manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_class_id_idx on public.tasks (class_id);
