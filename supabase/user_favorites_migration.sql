-- User Favorites Migration
-- Creates the user_favorites table for persisting user favorites

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only favorite a property once
  UNIQUE(user_id, property_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_property_id ON user_favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can remove their own favorites
CREATE POLICY "Users can remove own favorites"
  ON user_favorites FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Staff can view all favorites (for analytics)
CREATE POLICY "Staff can view all favorites"
  ON user_favorites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND user_type = 'staff'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE user_favorites IS 'Stores user favorite properties with automatic cleanup on user/property deletion';
