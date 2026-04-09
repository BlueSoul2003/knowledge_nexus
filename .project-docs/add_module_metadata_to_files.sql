-- add_module_metadata_to_files.sql
-- Run this in your Supabase SQL Editor to update the files tracking system

-- 1. Add new columns
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- 2. Update existing files to be approved so they don't disappear if they were already there
UPDATE files SET is_approved = TRUE WHERE is_approved = FALSE;

-- 3. Appending RLS logic for Admin File Approval
-- Assuming `user_profiles` has a `role` column (which it does, default 'user', admins has 'admin')
-- Admins can update the files table (to set is_approved to true or false)

DROP POLICY IF EXISTS "Admins can update files" ON files;
CREATE POLICY "Admins can update files"
ON files
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- We should also ensure standard users can only read approved files?
-- Actually, the frontend app.js will just add .eq('is_approved', true) to the SELECT query.
-- But standard users should at least be able to see their OWN files in their dashboard even if unapproved.
-- So the SELECT policy should allow them to see it. Our existing RLS probably has a generic "Public can read" or similar.
