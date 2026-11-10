/*
# Vaqtly core schema: profiles, tasks, habits, habit logs, notes

1. New Tables
- `profiles`: one row per signed-in user (display name, email, premium flag). Created automatically on sign-up.
- `tasks`: daily schedule items with time of day, title, description and completion state.
- `habits`: habit cards (name, icon, color).
- `habit_logs`: one row per habit per completed day.
- `notes`: quick notes with title, body and color.

2. Security
- Row level security is enabled on every table.
- Every table is owner-scoped: users only see and change rows where user_id = auth.uid().
- `profiles.is_premium` cannot be changed by the client. It is changed only through the `activate_premium` function.
- Free-tier limits (12 tasks per day, 3 habits, 10 notes) are enforced by database triggers. Premium users skip these limits.
- `handle_new_user` and the limit trigger functions are not callable through the API.

3. Important notes
- Section A: profile creation runs from a trigger on sign-up.
- Section B: free-tier limits are checked in the database, not just in the app.
- Section C: `activate_premium` is a simulated checkout used by the demo payment screen.
*/

-- Section A: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  is_premium boolean NOT NULL DEFAULT false,
  premium_since timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (name) ON profiles TO authenticated;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile name" ON profiles;
CREATE POLICY "Users can update own profile name"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  task_date date NOT NULL DEFAULT current_date,
  time_of_day text NOT NULL CHECK (time_of_day ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON tasks (user_id, task_date);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  icon text NOT NULL DEFAULT 'Repeat',
  color text NOT NULL DEFAULT '#2563eb',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS habits_user_idx ON habits (user_id);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON habits TO authenticated;

DROP POLICY IF EXISTS "Users can view own habits" ON habits;
CREATE POLICY "Users can view own habits"
ON habits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
CREATE POLICY "Users can insert own habits"
ON habits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own habits" ON habits;
CREATE POLICY "Users can update own habits"
ON habits FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
CREATE POLICY "Users can delete own habits"
ON habits FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Habit logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, log_date)
);

CREATE INDEX IF NOT EXISTS habit_logs_user_idx ON habit_logs (user_id, log_date);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON habit_logs TO authenticated;

DROP POLICY IF EXISTS "Users can view own habit logs" ON habit_logs;
CREATE POLICY "Users can view own habit logs"
ON habit_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own habit logs" ON habit_logs;
CREATE POLICY "Users can insert own habit logs"
ON habit_logs FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM habits h WHERE h.id = habit_id AND h.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own habit logs" ON habit_logs;
CREATE POLICY "Users can update own habit logs"
ON habit_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own habit logs" ON habit_logs;
CREATE POLICY "Users can delete own habit logs"
ON habit_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 120),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 5000),
  color text NOT NULL DEFAULT '#fde047',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_user_idx ON notes (user_id, created_at);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes"
ON notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes"
ON notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes"
ON notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Section B: free-tier limits enforced in the database
CREATE OR REPLACE FUNCTION public.enforce_task_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  is_pro boolean;
  current_count integer;
BEGIN
  SELECT p.is_premium INTO is_pro FROM public.profiles p WHERE p.id = NEW.user_id;
  IF COALESCE(is_pro, false) THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO current_count
  FROM public.tasks t
  WHERE t.user_id = NEW.user_id AND t.task_date = NEW.task_date;
  IF current_count >= 12 THEN
    RAISE EXCEPTION 'TASK_LIMIT_REACHED' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_task_limit_trg ON tasks;
CREATE TRIGGER enforce_task_limit_trg
BEFORE INSERT ON tasks
FOR EACH ROW EXECUTE FUNCTION public.enforce_task_limit();

CREATE OR REPLACE FUNCTION public.enforce_habit_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  is_pro boolean;
  current_count integer;
BEGIN
  SELECT p.is_premium INTO is_pro FROM public.profiles p WHERE p.id = NEW.user_id;
  IF COALESCE(is_pro, false) THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO current_count FROM public.habits h WHERE h.user_id = NEW.user_id;
  IF current_count >= 3 THEN
    RAISE EXCEPTION 'HABIT_LIMIT_REACHED' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_habit_limit_trg ON habits;
CREATE TRIGGER enforce_habit_limit_trg
BEFORE INSERT ON habits
FOR EACH ROW EXECUTE FUNCTION public.enforce_habit_limit();

CREATE OR REPLACE FUNCTION public.enforce_note_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  is_pro boolean;
  current_count integer;
BEGIN
  SELECT p.is_premium INTO is_pro FROM public.profiles p WHERE p.id = NEW.user_id;
  IF COALESCE(is_pro, false) THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO current_count FROM public.notes n WHERE n.user_id = NEW.user_id;
  IF current_count >= 10 THEN
    RAISE EXCEPTION 'NOTE_LIMIT_REACHED' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_note_limit_trg ON notes;
CREATE TRIGGER enforce_note_limit_trg
BEFORE INSERT ON notes
FOR EACH ROW EXECUTE FUNCTION public.enforce_note_limit();

-- Section C: simulated premium activation (demo checkout)
CREATE OR REPLACE FUNCTION public.activate_premium()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  UPDATE public.profiles
  SET is_premium = true,
      premium_since = COALESCE(premium_since, now())
  WHERE id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_premium() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activate_premium() TO authenticated;
