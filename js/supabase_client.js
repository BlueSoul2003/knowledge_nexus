import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// TODO: Replace these with your actual Supabase Project URL and Anon Key
// You can find these in your Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://zzaaascvbujcilanehow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWFhc2N2YnVqY2lsYW5laG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTEyOTYsImV4cCI6MjA5MDk2NzI5Nn0.nBWalucAS46U4DarH8bYe2IZOyHlyIIBv1MFtOydGfs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
