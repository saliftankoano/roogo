-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE property_status AS ENUM ('en_attente', 'en_ligne', 'closing', 'expired');
CREATE TYPE property_type AS ENUM ('villa', 'appartement', 'maison', 'terrain', 'commercial');
CREATE TYPE listing_type AS ENUM ('louer', 'vendre');

-- Create users table (synced with Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    user_type TEXT NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    listing_type listing_type NOT NULL,
    property_type property_type NOT NULL,
    status property_status DEFAULT 'en_attente',
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL(10,2),
    parking_spaces INTEGER,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    quartier TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    period TEXT, -- 'month' for rentals
    caution_mois INTEGER, -- deposit in months (0-12)
    interdictions TEXT[], -- array of restriction labels: "Pas d'animaux", "Pas de fumeurs", "Pas d'étudiants", "Pas de colocation"
    tier_id TEXT REFERENCES listing_tiers(id),
    tier_price DECIMAL(12,2),
    slot_limit INTEGER,
    slots_filled INTEGER DEFAULT 0,
    open_house_limit INTEGER,
    photo_limit INTEGER,
    video_included BOOLEAN DEFAULT false,
    has_premium_badge BOOLEAN DEFAULT false,
    photos_are_professional BOOLEAN DEFAULT false,
    closed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    views_count INTEGER DEFAULT 0
);

-- Create listing_tiers table
CREATE TABLE listing_tiers (
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

-- Insert listing_tiers data
INSERT INTO listing_tiers (id, name, photo_limit, slot_limit, video_included, open_house_limit, has_badge, min_price) VALUES
    ('essentiel', 'Essentiel', 8, 25, false, 1, false, 20000.00),
    ('standard', 'Standard', 8, 50, true, 2, false, 30000.00),
    ('premium', 'Premium', 15, 100, true, 3, true, 50000.00);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(property_id, user_id)
);

-- Create open_house_slots table
CREATE TABLE open_house_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create open_house_bookings table
CREATE TABLE open_house_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID REFERENCES open_house_slots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(slot_id, user_id)
);

-- Create property amenities table
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL -- store icon name/identifier
);

-- Create property_amenities junction table
CREATE TABLE property_amenities (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- Create property images table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create favorites table
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, property_id)
);

-- Insert default amenities (matching form schema)
INSERT INTO amenities (name, icon) VALUES
    ('wifi', 'Wifi'),
    ('parking', 'Car'),
    ('securite', 'Shield'),
    ('jardin', 'Trees'),
    ('solaires', 'Sun'),
    ('piscine', 'Waves'),
    ('meuble', 'Sofa');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for property details with agent info
CREATE VIEW property_details AS
SELECT 
    p.*,
    u.full_name as agent_name,
    u.avatar_url as agent_avatar,
    u.phone as agent_phone,
    u.email as agent_email,
    ARRAY_AGG(DISTINCT a.name) as amenities,
    ARRAY_AGG(DISTINCT pi.url) as images,
    (
        SELECT COUNT(*)
        FROM favorites f
        WHERE f.property_id = p.id
    ) as favorites_count
FROM properties p
LEFT JOIN users u ON p.agent_id = u.id
LEFT JOIN property_amenities pa ON p.id = pa.property_id
LEFT JOIN amenities a ON pa.amenity_id = a.id
LEFT JOIN property_images pi ON p.id = pi.property_id
GROUP BY p.id, u.id;

-- Create RLS policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_house_bookings ENABLE ROW LEVEL SECURITY;

-- Listing Tiers Policies
CREATE POLICY "Listing tiers are viewable by everyone" ON listing_tiers
    FOR SELECT USING (true);

-- Applications Policies
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Agents can view applications for their properties" ON applications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND agent_id = auth.uid()
    ));

CREATE POLICY "Users can create their own applications" ON applications
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Open House Slots Policies
CREATE POLICY "Open house slots are viewable by everyone" ON open_house_slots
    FOR SELECT USING (true);

CREATE POLICY "Agents can manage slots for their properties" ON open_house_slots
    FOR ALL USING (EXISTS (
        SELECT 1 FROM properties WHERE id = property_id AND agent_id = auth.uid()
    ));

-- Open House Bookings Policies
CREATE POLICY "Users can view their own bookings" ON open_house_bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Agents can view bookings for their properties" ON open_house_bookings
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM open_house_slots s
        JOIN properties p ON s.property_id = p.id
        WHERE s.id = slot_id AND p.agent_id = auth.uid()
    ));

CREATE POLICY "Users can create their own bookings" ON open_house_bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trigger for applications
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

CREATE TRIGGER on_application_change
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_property_slots_filled();

-- Trigger to close listing when slot limit is reached
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

CREATE TRIGGER tr_close_property_on_limit
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION close_property_on_limit_reached();

-- Properties policies
CREATE POLICY "Properties are viewable by everyone"
    ON properties FOR SELECT
    USING (true);

CREATE POLICY "Properties can be inserted by agents"
    ON properties FOR INSERT
    WITH CHECK (agent_id = auth.uid() AND EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'agent'
    ));

CREATE POLICY "Properties can be updated by their agents"
    ON properties FOR UPDATE
    USING (agent_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (user_id = auth.uid());

-- Create function for Clerk webhook handling
CREATE OR REPLACE FUNCTION handle_clerk_webhook()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO users (clerk_id, email, full_name, avatar_url)
        VALUES (NEW.clerk_id, NEW.email, NEW.full_name, NEW.avatar_url);
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE users
        SET email = NEW.email,
            full_name = NEW.full_name,
            avatar_url = NEW.avatar_url
        WHERE clerk_id = NEW.clerk_id;
    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM users WHERE clerk_id = OLD.clerk_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
