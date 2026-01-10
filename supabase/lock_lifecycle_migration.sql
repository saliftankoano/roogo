-- 1. Add 'finalized' to property_status enum
DO $$ BEGIN
    ALTER TYPE property_status ADD VALUE 'finalized';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update property_locks table
ALTER TABLE property_locks 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notification_sent_day3 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_day5 BOOLEAN DEFAULT FALSE;

-- Update existing locks to have an expiry if they don't have one (7 days from locked_at)
UPDATE property_locks 
SET expires_at = locked_at + INTERVAL '7 days'
WHERE expires_at IS NULL;

-- Note: status in property_locks is a TEXT column in early_bird_migration.sql
-- We'll just document the new supported values: 'active', 'finalized', 'expired'
-- 'completed' from previous migration will be treated as 'finalized'
UPDATE property_locks SET status = 'finalized' WHERE status = 'completed';
