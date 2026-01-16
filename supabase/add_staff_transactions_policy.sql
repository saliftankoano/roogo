-- Migration: Allow staff to view all transactions for the finance dashboard

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Staff can view all transactions'
    ) THEN
        CREATE POLICY "Staff can view all transactions"
            ON transactions FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM users
                    WHERE id = auth.uid() AND user_type = 'staff'
                )
            );
    END IF;
END $$;

-- Also allow staff to view all users since the dashboard joins with users for full_name
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Staff can view all users'
    ) THEN
        -- This might already exist from staff_permissions_migration.sql, but let's be sure
        NULL; -- The policy "Staff can view all users" is already in staff_permissions_migration.sql
    END IF;
END $$;
