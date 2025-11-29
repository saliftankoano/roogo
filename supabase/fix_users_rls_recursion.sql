-- Fix: Users table RLS infinite recursion
-- Since we use Clerk auth (not Supabase auth), auth.uid() is NULL
-- We need to allow public read access for basic user profiles

-- Drop the problematic policies
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Staff can update all users" ON users;

-- Allow anyone to read basic user info (for property agent display)
-- This is safe since user profiles are meant to be publicly visible for agents/owners
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Disable RLS-based updates since we use Clerk auth
-- Updates should go through the backend API with service role key
-- (The webhook already uses service role to sync users)

COMMENT ON POLICY "Users are viewable by everyone" ON users IS 
'Allow public read of user profiles for agent info display. Updates are handled via backend API with service role key (Clerk webhook sync).';

