-- Migration: Ensure sensitive tables are protected by RLS
-- We use Server Actions with the Service Role Key for Admin operations,
-- so we don't need public RLS policies for these tables.

-- 1. Ensure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- 2. Drop the insecure public policies if they were created
DROP POLICY IF EXISTS "Anyone can view transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can view applications" ON applications;
DROP POLICY IF EXISTS "Anyone can view open house slots" ON open_house_slots;
DROP POLICY IF EXISTS "Anyone can view open house bookings" ON open_house_bookings;
DROP POLICY IF EXISTS "Anyone can view property locks" ON property_locks;
DROP POLICY IF EXISTS "Anyone can view user push tokens" ON user_push_tokens;

-- 3. (Optional) Re-add owner-specific policies if you want users to see their own data in the mobile app
-- These are safe because they check 'auth.uid()' (which would require you to set up Clerk-Supabase JWT integration later)
-- For now, they will just deny access to anon users, which is secure.
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions') THEN
        CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;
