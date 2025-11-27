-- Migration: Update schema to match listing form
-- Run this on existing Supabase database

-- Add new columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS caution_mois INTEGER,
ADD COLUMN IF NOT EXISTS interdictions TEXT[];

-- Add width and height columns to property_images table
ALTER TABLE property_images 
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER;

-- Update existing property_images to set default dimensions if NULL
-- (You may want to update these with actual dimensions later)
UPDATE property_images 
SET width = 1024, height = 768 
WHERE width IS NULL OR height IS NULL;

-- Make width and height NOT NULL after setting defaults
ALTER TABLE property_images 
ALTER COLUMN width SET NOT NULL,
ALTER COLUMN height SET NOT NULL;

-- Update amenities to match form schema
-- First, delete old amenities that don't match
DELETE FROM amenities WHERE name IN ('security', 'garden', 'solar_panels', 'pool', 'furnished', 'tv_room');

-- Insert new amenities with correct names
INSERT INTO amenities (name, icon) VALUES
    ('securite', 'Shield'),
    ('jardin', 'Trees'),
    ('solaires', 'Sun'),
    ('piscine', 'Waves'),
    ('meuble', 'Sofa')
ON CONFLICT (name) DO NOTHING;

-- Verify amenities (optional - for checking)
-- SELECT * FROM amenities ORDER BY name;

