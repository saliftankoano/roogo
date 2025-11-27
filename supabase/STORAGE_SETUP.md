# Supabase Storage Setup

To enable image uploads for property listings, you need to create a storage bucket in Supabase.

## Steps:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create a bucket named: `listing`
5. Set the bucket to **Public** (so images can be accessed via public URLs)
6. Disable RLS for the bucket (since we're using Clerk for authentication, not Supabase Auth)

### Storage Policies

Since you're using Clerk (not Supabase Auth), the standard RLS policies with `auth.uid()` won't work.

**Option 1: Disable RLS (Recommended for simplicity)**

In the Supabase dashboard:

- Go to Storage → `listing` bucket
- Click on "Policies"
- Disable RLS for the bucket

This allows your mobile app to upload images directly using the anon key.

**Option 2: Custom RLS with Service Account (More secure)**

If you want tighter security, handle image uploads through your backend API that uses the service key. The backend policies are already configured in your `roogo-backend` repository.

For now, disabling RLS on the storage bucket is the simplest approach.

## Environment Variables

Make sure you have these environment variables set in your `.env` file or Expo config:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **API**.
