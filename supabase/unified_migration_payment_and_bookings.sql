-- 1. Safely create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('listing_submission', 'photography');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE property_status ADD VALUE 'closing';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create listing_tiers table
CREATE TABLE IF NOT EXISTS listing_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    photo_limit INTEGER NOT NULL,
    slot_limit INTEGER NOT NULL,
    video_included BOOLEAN NOT NULL DEFAULT false,
    open_house_limit INTEGER NOT NULL,
    has_badge BOOLEAN NOT NULL DEFAULT false,
    min_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Seed listing_tiers data
INSERT INTO listing_tiers (id, name, photo_limit, slot_limit, video_included, open_house_limit, has_badge, min_price)
VALUES 
    ('essentiel', 'Essentiel', 8, 25, false, 1, false, 20000.00),
    ('standard', 'Standard', 8, 50, true, 2, false, 30000.00),
    ('premium', 'Premium', 15, 100, true, 3, true, 50000.00)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    photo_limit = EXCLUDED.photo_limit,
    slot_limit = EXCLUDED.slot_limit,
    video_included = EXCLUDED.video_included,
    open_house_limit = EXCLUDED.open_house_limit,
    has_badge = EXCLUDED.has_badge,
    min_price = EXCLUDED.min_price;

-- 3. Extend properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS tier_id TEXT REFERENCES listing_tiers(id),
ADD COLUMN IF NOT EXISTS tier_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS slot_limit INTEGER,
ADD COLUMN IF NOT EXISTS slots_filled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS open_house_limit INTEGER,
ADD COLUMN IF NOT EXISTS photo_limit INTEGER,
ADD COLUMN IF NOT EXISTS video_included BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_premium_badge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photos_are_professional BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 4. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deposit_id TEXT NOT NULL UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'XOF',
    status transaction_status DEFAULT 'pending',
    type transaction_type NOT NULL,
    provider TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    payer_phone TEXT,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(property_id, user_id)
);

-- 6. Create open_house_slots table
CREATE TABLE IF NOT EXISTS open_house_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Create open_house_bookings table
CREATE TABLE IF NOT EXISTS open_house_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID REFERENCES open_house_slots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(slot_id, user_id)
);

-- 8. Enable RLS and create policies (wrapped in checks to avoid duplicates)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_bookings ENABLE ROW LEVEL SECURITY;

-- Transactions policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Listing Tiers policies
DO $$ BEGIN
    CREATE POLICY "Listing tiers are viewable by everyone" ON listing_tiers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Applications policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own applications" ON applications FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Agents can view applications for their properties" ON applications FOR SELECT USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND agent_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create their own applications" ON applications FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Open House Slots policies
DO $$ BEGIN
    CREATE POLICY "Open house slots are viewable by everyone" ON open_house_slots FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Agents can manage slots for their properties" ON open_house_slots FOR ALL USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND agent_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Open House Bookings policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own bookings" ON open_house_bookings FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Agents can view bookings for their properties" ON open_house_bookings FOR SELECT USING (EXISTS (
        SELECT 1 FROM open_house_slots s JOIN properties p ON s.property_id = p.id WHERE s.id = slot_id AND p.agent_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create their own bookings" ON open_house_bookings FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 9. Triggers
CREATE OR REPLACE FUNCTION update_property_slots_filled()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE properties SET slots_filled = (
            SELECT COUNT(*) FROM applications WHERE property_id = NEW.property_id
        ) WHERE id = NEW.property_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE properties SET slots_filled = (
            SELECT COUNT(*) FROM applications WHERE property_id = OLD.property_id
        ) WHERE id = OLD.property_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_change ON applications;
CREATE TRIGGER on_application_change
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_property_slots_filled();

-- 10. Listing Lifecycle Triggers (Auto-close on limit reached)
CREATE OR REPLACE FUNCTION close_property_on_limit_reached()
RETURNS TRIGGER AS $$
DECLARE
    v_slot_limit INTEGER;
    v_slots_filled INTEGER;
BEGIN
    -- Get current limits and counts
    SELECT slot_limit, slots_filled INTO v_slot_limit, v_slots_filled
    FROM properties
    WHERE id = NEW.property_id;

    -- Check if limit is reached
    IF v_slots_filled >= v_slot_limit AND v_slot_limit > 0 THEN
        UPDATE properties
        SET 
            status = 'closing',
            closed_at = NOW(),
            expires_at = NOW() + INTERVAL '3 days'
        WHERE id = NEW.property_id AND status = 'en_ligne';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_close_property_on_limit ON applications;
CREATE TRIGGER tr_close_property_on_limit
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION close_property_on_limit_reached();

-- Daily cleanup function to expire listings
CREATE OR REPLACE FUNCTION expire_closed_properties()
RETURNS VOID AS $$
BEGIN
    UPDATE properties
    SET status = 'expired'
    WHERE status = 'closing' AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger for transactions updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

