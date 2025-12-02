-- Supabase RLS Policies for TODAY app
-- Execute this in your Supabase SQL Editor to enable Row Level Security

-- ============================================
-- USERS TABLE
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_insert_self ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS users_delete_own ON public.users;

CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY users_insert_self ON public.users
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);

CREATE POLICY users_delete_own ON public.users
  FOR DELETE USING (id = auth.uid()::text);


-- ============================================
-- ENTRIES TABLE
-- ============================================
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS entries_select_own ON public.entries;
DROP POLICY IF EXISTS entries_insert_own ON public.entries;
DROP POLICY IF EXISTS entries_update_own ON public.entries;
DROP POLICY IF EXISTS entries_delete_own ON public.entries;

CREATE POLICY entries_select_own ON public.entries
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY entries_insert_own ON public.entries
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY entries_update_own ON public.entries
  FOR UPDATE USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY entries_delete_own ON public.entries
  FOR DELETE USING (user_id = auth.uid()::text);


-- ============================================
-- TODOS TABLE
-- ============================================
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS todos_select_own ON public.todos;
DROP POLICY IF EXISTS todos_insert_own ON public.todos;
DROP POLICY IF EXISTS todos_update_own ON public.todos;
DROP POLICY IF EXISTS todos_delete_own ON public.todos;

CREATE POLICY todos_select_own ON public.todos FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY todos_insert_own ON public.todos FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY todos_update_own ON public.todos FOR UPDATE USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY todos_delete_own ON public.todos FOR DELETE USING (user_id = auth.uid()::text);


-- ============================================
-- PRAYERS TABLE
-- ============================================
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prayers_select_own ON public.prayers;
DROP POLICY IF EXISTS prayers_insert_own ON public.prayers;
DROP POLICY IF EXISTS prayers_update_own ON public.prayers;
DROP POLICY IF EXISTS prayers_delete_own ON public.prayers;

CREATE POLICY prayers_select_own ON public.prayers FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY prayers_insert_own ON public.prayers FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY prayers_update_own ON public.prayers FOR UPDATE USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY prayers_delete_own ON public.prayers FOR DELETE USING (user_id = auth.uid()::text);


-- ============================================
-- SHORTCUTS TABLE
-- ============================================
ALTER TABLE public.shortcuts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shortcuts_select_own ON public.shortcuts;
DROP POLICY IF EXISTS shortcuts_insert_own ON public.shortcuts;
DROP POLICY IF EXISTS shortcuts_update_own ON public.shortcuts;
DROP POLICY IF EXISTS shortcuts_delete_own ON public.shortcuts;

CREATE POLICY shortcuts_select_own ON public.shortcuts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY shortcuts_insert_own ON public.shortcuts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY shortcuts_update_own ON public.shortcuts FOR UPDATE USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY shortcuts_delete_own ON public.shortcuts FOR DELETE USING (user_id = auth.uid()::text);


-- ============================================
-- NOTES TABLE
-- ============================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notes_select_own ON public.notes;
DROP POLICY IF EXISTS notes_insert_own ON public.notes;
DROP POLICY IF EXISTS notes_update_own ON public.notes;
DROP POLICY IF EXISTS notes_delete_own ON public.notes;

CREATE POLICY notes_select_own ON public.notes FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY notes_insert_own ON public.notes FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY notes_update_own ON public.notes FOR UPDATE USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY notes_delete_own ON public.notes FOR DELETE USING (user_id = auth.uid()::text);


-- ============================================
-- SETTINGS TABLE
-- ============================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS settings_select_own ON public.settings;
DROP POLICY IF EXISTS settings_insert_own ON public.settings;
DROP POLICY IF EXISTS settings_update_own ON public.settings;
DROP POLICY IF EXISTS settings_delete_own ON public.settings;

CREATE POLICY settings_select_own ON public.settings FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY settings_insert_own ON public.settings FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY settings_update_own ON public.settings FOR UPDATE USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY settings_delete_own ON public.settings FOR DELETE USING (user_id = auth.uid()::text);

-- End of RLS Policies
