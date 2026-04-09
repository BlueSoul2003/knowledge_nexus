-- ================================================================
-- Migration: Create user_profiles table (run in Supabase SQL Editor)
-- This table links to Supabase Auth (auth.users) via the user's UUID.
-- ================================================================

CREATE TABLE public.user_profiles (
  -- Primary key matches the Supabase Auth user ID
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contact / identity
  email         TEXT,
  full_name     TEXT,
  phone         TEXT,

  -- Demographics
  age           INTEGER,
  gender        TEXT        CHECK (gender IN ('male', 'female', 'other', '') OR gender IS NULL),
  syllabus      TEXT,

  -- Platform fields
  role          TEXT        NOT NULL DEFAULT 'user',
  exp           INTEGER     NOT NULL DEFAULT 0,

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow each user to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow each user to insert / update their own profile
CREATE POLICY "Users can upsert own profile"
  ON public.user_profiles
  FOR ALL
  USING      (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Auto-create a profile row whenever a new Auth user signs up ──
-- This trigger fires on INSERT into auth.users and seeds a minimal row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, age, gender, syllabus, role, exp)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'full_name'),
    (NEW.raw_user_meta_data->>'phone'),
    NULLIF((NEW.raw_user_meta_data->>'age'), '')::INTEGER,
    NULLIF((NEW.raw_user_meta_data->>'gender'), ''),
    NULLIF((NEW.raw_user_meta_data->>'syllabus'), ''),
    'user',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
