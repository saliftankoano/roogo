-- Migration: Add RPC function to increment property views count
-- This enables atomic increment of views without race conditions

CREATE OR REPLACE FUNCTION increment_property_views(property_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE properties
  SET views_count = views_count + 1
  WHERE id = property_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION increment_property_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_property_views(UUID) TO authenticated;
