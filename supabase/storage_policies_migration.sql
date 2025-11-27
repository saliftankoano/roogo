-- Migration: Configure Storage Policies for 'listing' bucket
-- This allows uploads from the mobile app using the anon key

-- Enable RLS on the storage objects table for the listing bucket
-- Note: Storage uses a special schema called 'storage'

-- Allow anyone to upload to the listing bucket
CREATE POLICY "Anyone can upload to listing bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing');

-- Allow anyone to update files in listing bucket
CREATE POLICY "Anyone can update listing bucket files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing');

-- Allow anyone to read from listing bucket (for public access)
CREATE POLICY "Anyone can read from listing bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing');

-- Allow anyone to delete from listing bucket (optional - you may want to restrict this)
CREATE POLICY "Anyone can delete from listing bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing');

-- Make the bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'listing';

-- Note: If you want more security, you can modify these policies to check
-- for authenticated users or specific conditions. But since you're using Clerk
-- (not Supabase Auth), the easiest approach is to allow public access and
-- rely on your backend API for authorization.

