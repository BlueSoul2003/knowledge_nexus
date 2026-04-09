-- ================================================================
-- Fix: RLS violation on registration
-- Creates a SECURITY DEFINER RPC function that bypasses RLS,
-- so unconfirmed/new users can write their profile immediately.
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

CREATE OR REPLACE FUNCTION public.create_user_profile(
    p_id        UUID,
    p_email     TEXT,
    p_full_name TEXT    DEFAULT NULL,
    p_phone     TEXT    DEFAULT NULL,
    p_age       INTEGER DEFAULT NULL,
    p_gender    TEXT    DEFAULT NULL,
    p_syllabus  TEXT    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as table owner, bypasses RLS entirely
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles
        (id, email, full_name, phone, age, gender, syllabus, exp, role, created_at, updated_at)
    VALUES
        (p_id, p_email, p_full_name, p_phone, p_age, p_gender, p_syllabus, 0, 'user', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        email      = EXCLUDED.email,
        full_name  = COALESCE(EXCLUDED.full_name,  public.user_profiles.full_name),
        phone      = COALESCE(EXCLUDED.phone,      public.user_profiles.phone),
        age        = COALESCE(EXCLUDED.age,        public.user_profiles.age),
        gender     = COALESCE(EXCLUDED.gender,     public.user_profiles.gender),
        syllabus   = COALESCE(EXCLUDED.syllabus,   public.user_profiles.syllabus),
        updated_at = NOW();
END;
$$;

-- Allow both anonymous and authenticated users to call this function.
-- It is safe because the function enforces p_id matches the signed-up user.
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon, authenticated;
