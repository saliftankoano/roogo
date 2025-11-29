-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE property_status AS ENUM ('en_attente', 'en_ligne', 'expired');
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    views_count INTEGER DEFAULT 0
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
