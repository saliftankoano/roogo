-- Migration to add agent-specific fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Update the user_type default if it's still 'buyer' to something more consistent with USER_TYPES.md if needed
-- But we'll leave it for now as 'buyer' seems to be the default 'renter' internally.

-- Drop the view first to avoid "cannot change name of view column" errors
DROP VIEW IF EXISTS property_details;

-- Recreate the view with agent's company info
CREATE VIEW property_details AS
SELECT 
    p.*,
    u.full_name as agent_name,
    u.avatar_url as agent_avatar,
    u.phone as agent_phone,
    u.email as agent_email,
    u.company_name as agent_company_name,
    u.facebook_url as agent_facebook_url,
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

