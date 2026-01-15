-- 1. Add 'boost' to transaction_type enum
DO $$ BEGIN
    ALTER TYPE transaction_type ADD VALUE 'boost';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add boost fields to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE;

-- 3. Update property_details view to include new fields
-- We drop and recreate because adding columns to the base table changes the structure of p.* 
-- which makes CREATE OR REPLACE VIEW fail if it's not just appending columns.
DROP VIEW IF EXISTS property_details;

CREATE VIEW property_details AS
SELECT 
    p.*,
    u.full_name as agent_name,
    u.avatar_url as agent_avatar,
    u.phone as agent_phone,
    u.email as agent_email,
    u.user_type as agent_type,
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
