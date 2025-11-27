-- Fix Storage Policies for 'listing' bucket
-- First, drop existing policies if they exist, then recreate them

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload to listing bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update listing bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read from listing bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from listing bucket" ON storage.objects;

-- Recreate policies with proper permissions
CREATE POLICY "Anyone can upload to listing bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing');

CREATE POLICY "Anyone can update listing bucket files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing');

CREATE POLICY "Anyone can read from listing bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing');

CREATE POLICY "Anyone can delete from listing bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing');

-- Make sure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'listing';

-- Verify the bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'listing';

