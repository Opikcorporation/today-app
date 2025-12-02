-- Supabase / Postgres schema for TODAY app
-- Run these statements in your Supabase SQL Editor

-- 1) users table
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  email text,
  pseudo text,
  avatar text,
  accent_color text DEFAULT '#f97316',
  created_at timestamptz DEFAULT now()
);

-- 2) entries table
CREATE TABLE IF NOT EXISTS public.entries (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text text,
  timestamp timestamptz,
  date text,
  time text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entries_user_idx ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS entries_timestamp_idx ON public.entries(timestamp);

-- 3) todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text text,
  done boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS todos_user_idx ON public.todos(user_id);

-- 4) prayers table
CREATE TABLE IF NOT EXISTS public.prayers (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text text,
  answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS prayers_user_idx ON public.prayers(user_id);

-- 5) shortcuts table
CREATE TABLE IF NOT EXISTS public.shortcuts (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url text,
  title text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shortcuts_user_idx ON public.shortcuts(user_id);

-- 6) notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text,
  content text,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notes_user_idx ON public.notes(user_id);

-- 7) settings table (key/value, value stored as jsonb)
CREATE TABLE IF NOT EXISTS public.settings (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, key)
);
CREATE INDEX IF NOT EXISTS settings_user_key_idx ON public.settings(user_id, key);

-- Notes:
-- - The app currently upserts by `id`, so ensure clients generate stable ids (e.g. timestamp strings) or use UUIDs.
-- - If you prefer numeric ids, change `id text PRIMARY KEY` to `id uuid DEFAULT gen_random_uuid()` and adapt the client.
-- - `settings.value` is jsonb and can store objectives/habitConfig as JSON objects.

-- Optional: create helper function to upsert by id using pg_upsert (not necessary if using Supabase client upsert)

-- End of schema
