-- ============================================================
-- MindAnchor — Supabase Database Migration
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- USERS PROFILE (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  exam_type text check (exam_type in ('NEET','JEE','CUET','CAT','GATE','UPSC','OTHER')),
  exam_date date,
  study_intensity text check (study_intensity in ('light','moderate','intense')),
  weak_subjects text[],
  streak_count integer default 0,
  created_at timestamptz default now()
);

-- JOURNAL ENTRIES
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  entry_text text not null,
  created_at timestamptz default now()
);

-- ENTRY ANALYSES (Gemini structured output stored here)
create table public.entry_analyses (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references public.journal_entries(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  mood_score integer check (mood_score between 1 and 10),
  stress_score integer check (stress_score between 1 and 10),
  confidence_score integer check (confidence_score between 1 and 10),
  burnout_risk text check (burnout_risk in ('low','moderate','high','critical')),
  dominant_emotion text,
  stress_triggers text[],
  cognitive_patterns text[],
  support_priority text check (support_priority in ('none','gentle','active','urgent')),
  gemini_insight text,
  created_at timestamptz default now()
);

-- CHAT SESSIONS (companion conversation history)
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  messages jsonb not null default '[]',
  session_date date default current_date,
  created_at timestamptz default now()
);

-- COPING ACTIONS (triggered interventions log)
create table public.coping_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action_type text check (action_type in (
    'breathing','grounding','affirmation','lighter_plan','exam_prep_boost','rest_mode'
  )),
  triggered_by text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.entry_analyses enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.coping_actions enable row level security;

-- RLS Policies (users can only access their own data)
create policy "Users own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users own entries" on public.journal_entries for all using (auth.uid() = user_id);
create policy "Users own analyses" on public.entry_analyses for all using (auth.uid() = user_id);
create policy "Users own chats" on public.chat_sessions for all using (auth.uid() = user_id);
create policy "Users own actions" on public.coping_actions for all using (auth.uid() = user_id);

-- ============================================================
-- Helper: Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
