-- RLS Policy for property_images table
-- Allow viewing images for properties that are viewable (status = 'en_ligne')
-- Note: Since we use Clerk auth (not Supabase auth), auth.uid() is NULL in RLS policies
-- Staff access to all images should be handled through the backend API using service role key

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Property images are viewable for active properties" ON property_images;

-- Create policy to allow viewing images for active properties
-- This applies to frontend queries using the anon key
CREATE POLICY "Property images are viewable for active properties"
    ON property_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = property_images.property_id
            AND properties.status = 'en_ligne'
        )
    );

COMMENT ON POLICY "Property images are viewable for active properties" ON property_images IS 
'Allows anyone to view images for properties with status "en_ligne" (online/active). Images for pending or expired properties are not accessible through frontend queries. Staff users should access all images through the backend API which uses the service role key to bypass RLS.';

