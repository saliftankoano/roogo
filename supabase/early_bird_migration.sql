-- 1. Add 'locked' to property_status enum
-- Note: PostgreSQL doesn't support IF NOT EXISTS for adding enum values in a single statement easily, 
-- so we use a safe block.
DO $$ BEGIN
    ALTER TYPE property_status ADD VALUE 'locked';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add 'property_lock' to transaction_type enum
DO $$ BEGIN
    ALTER TYPE transaction_type ADD VALUE 'property_lock';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add published_at column to properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 4. Create user_push_tokens table
CREATE TABLE IF NOT EXISTS user_push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    expo_push_token TEXT NOT NULL UNIQUE,
    platform TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create property_locks table
CREATE TABLE IF NOT EXISTS property_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL UNIQUE,
    renter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    lock_fee DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'owner_rejected', 'completed', 'refunded'
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_locks ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- user_push_tokens: users can manage their own tokens
DO $$ BEGIN
    CREATE POLICY "Users can manage their own push tokens" ON user_push_tokens 
    FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- property_locks: renters can view their own locks, agents can view locks on their properties
DO $$ BEGIN
    CREATE POLICY "Users can view their own locks" ON property_locks 
    FOR SELECT USING (renter_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Agents can view locks on their properties" ON property_locks 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND agent_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Trigger for updating user_push_tokens.updated_at
DROP TRIGGER IF EXISTS update_user_push_tokens_updated_at ON user_push_tokens;
CREATE TRIGGER update_user_push_tokens_updated_at
    BEFORE UPDATE ON user_push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Trigger to set published_at when status changes to 'en_ligne'
CREATE OR REPLACE FUNCTION set_property_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'en_ligne' AND (OLD.status IS NULL OR OLD.status != 'en_ligne')) THEN
        NEW.published_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_published_at ON properties;
CREATE TRIGGER tr_set_published_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION set_property_published_at();

