-- Migration: Add staff permissions to RLS policies
-- Staff users should have admin access to manage all properties

-- Drop existing policies to recreate them with staff permissions
DROP POLICY IF EXISTS "Properties can be inserted by owners" ON properties;
DROP POLICY IF EXISTS "Properties can be updated by their owners" ON properties;
DROP POLICY IF EXISTS "Properties can be deleted by their owners" ON properties;
DROP POLICY IF EXISTS "Properties can be inserted by agents" ON properties;
DROP POLICY IF EXISTS "Properties can be updated by their agents" ON properties;
DROP POLICY IF EXISTS "Properties can be deleted by their agents" ON properties;

-- Properties INSERT: Allow owners to create their own properties, staff to create any
CREATE POLICY "Properties can be inserted by owners and staff"
    ON properties FOR INSERT
    WITH CHECK (
        -- Owners can only create properties for themselves
        (agent_id = auth.uid() AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'owner'
        ))
        OR
        -- Staff can create properties for any owner
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'staff'
        )
    );

-- Properties UPDATE: Allow owners to update their own, staff to update any
CREATE POLICY "Properties can be updated by owners and staff"
    ON properties FOR UPDATE
    USING (
        -- Owners can update their own properties
        agent_id = auth.uid()
        OR
        -- Staff can update any property
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'staff'
        )
    );

-- Properties DELETE: Allow owners to delete their own, staff to delete any
CREATE POLICY "Properties can be deleted by owners and staff"
    ON properties FOR DELETE
    USING (
        -- Owners can delete their own properties
        agent_id = auth.uid()
        OR
        -- Staff can delete any property
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'staff'
        )
    );

-- Users table policies: Staff can view and manage all users
CREATE POLICY "Staff can view all users"
    ON users FOR SELECT
    USING (
        -- Users can view their own profile
        id = auth.uid()
        OR
        -- Staff can view all users
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'staff'
        )
    );

CREATE POLICY "Staff can update all users"
    ON users FOR UPDATE
    USING (
        -- Users can update their own profile
        id = auth.uid()
        OR
        -- Staff can update any user
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'staff'
        )
    );

-- Property images policies: Allow staff to manage all images
DROP POLICY IF EXISTS "Property images can be deleted by property owner" ON property_images;

CREATE POLICY "Property images can be deleted by owner or staff"
    ON property_images FOR DELETE
    USING (
        -- Property owner can delete images
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_images.property_id 
            AND p.agent_id = auth.uid()
        )
        OR
        -- Staff can delete any image
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND user_type = 'staff'
        )
    );

-- Helper function to check if current user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'staff'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_staff() IS 'Helper function to check if current authenticated user is staff';

