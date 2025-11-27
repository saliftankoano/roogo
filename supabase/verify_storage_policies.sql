-- Verify Storage Policies for 'listing' bucket

-- Check all policies on storage.objects
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%listing%'
ORDER BY policyname;

-- Check if RLS is enabled on storage.objects
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Verify bucket configuration
SELECT 
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'listing';
