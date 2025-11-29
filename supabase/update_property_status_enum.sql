-- Migration: Update property_status enum to use standardized values
-- Changes: 'brouillon', 'en_attente', 'actif', 'inactif' -> 'en_attente', 'en_ligne', 'expired'

-- Step 1: Drop the property_details view (it depends on the status column)
DROP VIEW IF EXISTS property_details;

-- Step 2: Convert status column to TEXT temporarily to allow any values
ALTER TABLE properties 
ALTER COLUMN status TYPE TEXT;

-- Step 3: Update existing records to new status values (as TEXT)
UPDATE properties 
SET status = 'en_ligne' 
WHERE status = 'actif';

UPDATE properties 
SET status = 'expired' 
WHERE status = 'inactif';

UPDATE properties 
SET status = 'en_attente' 
WHERE status = 'brouillon';

-- Step 4: Drop the default constraint (it depends on the enum type)
ALTER TABLE properties 
ALTER COLUMN status DROP DEFAULT;

-- Step 5: Drop the old enum type (CASCADE will drop dependent objects)
DROP TYPE IF EXISTS property_status CASCADE;

-- Step 6: Create the new enum with standardized values
CREATE TYPE property_status AS ENUM ('en_attente', 'en_ligne', 'expired');

-- Step 7: Update the column back to use the new enum
ALTER TABLE properties 
ALTER COLUMN status TYPE property_status USING status::property_status;

-- Step 8: Set default to 'en_attente'
ALTER TABLE properties 
ALTER COLUMN status SET DEFAULT 'en_attente';

-- Step 9: Recreate the property_details view
CREATE VIEW property_details AS
SELECT 
    p.*,
    u.full_name as agent_name,
    u.avatar_url as agent_avatar,
    u.phone as agent_phone,
    u.email as agent_email,
    ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL) as amenities,
    ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.url IS NOT NULL) as images,
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

COMMENT ON TYPE property_status IS 'Property status: en_attente (pending review), en_ligne (online/active), expired (rented/sold)';
