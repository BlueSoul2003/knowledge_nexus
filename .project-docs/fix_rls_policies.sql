-- ================================================================
-- Run this in Supabase Dashboard → SQL Editor
-- Fixes RLS so newly registered users can write their own profile
-- ================================================================

-- Drop all existing policies on user_profiles to start clean
DROP POLICY IF EXISTS "Users can view own profile"     ON public.user_profiles;
DROP POLICY IF EXISTS "Users can upsert own profile"   ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile"   ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile"   ON public.user_profiles;

-- Make sure RLS is ON
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ── Policy 1: SELECT — authenticated users can read their own row
CREATE POLICY "select_own_profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ── Policy 2: INSERT — authenticated users can create their own row
CREATE POLICY "insert_own_profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ── Policy 3: UPDATE — authenticated users can edit their own row
CREATE POLICY "update_own_profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING      (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Policy 4: Allow the trigger function (SECURITY DEFINER) to insert
-- The handle_new_user() trigger runs as the table owner so it bypasses RLS.
-- No extra policy needed for it — it already works.

-- ── Verify the table currently looks right
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
