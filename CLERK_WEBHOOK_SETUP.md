# Clerk Webhook Setup

Your Clerk webhook is configured in the `roogo-backend` repository.

## ✅ What's Already Set Up

Your backend at `/roogo-backend` has:
- Clerk webhook handler at `/api/clerk/webhook`
- User sync logic that creates/updates/deletes users in Supabase
- Proper signature verification with `svix`
- User type mapping (`owner` → `agent`, `renter` → `buyer`)

## Setup Steps

### 1. Ensure Environment Variables (in roogo-backend)

Create/update `.env` file in `roogo-backend`:

```env
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Deploy Backend

Deploy your `roogo-backend` to Vercel (or your hosting):

```bash
cd /Users/salif/Documents/bf226/roogo-backend
vercel
```

After deployment, you'll get a URL like: `https://your-backend.vercel.app`

### 3. Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks**
3. Click **Add Endpoint**
4. Enter webhook URL: `https://your-backend.vercel.app/api/clerk/webhook`
5. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add it to your backend `.env` as `CLERK_WEBHOOK_SECRET`

### 4. Test the Webhook

After deployment:
1. Create a test user in Clerk
2. Check your backend logs (Vercel logs)
3. Check Supabase `users` table - user should appear automatically
4. Check Clerk webhook logs for delivery status

### 5. Update Mobile App (roogo)

Ensure your mobile app `.env` has:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The mobile app will now work seamlessly - users created in Clerk will automatically sync to Supabase!

## How It Works

```
User signs up in mobile app (Clerk)
         ↓
Clerk sends webhook to backend
         ↓
Backend receives at /api/clerk/webhook
         ↓
Backend verifies signature (security)
         ↓
Backend creates user in Supabase
         ↓
User can now submit properties!
```

## Troubleshooting

- **Webhook not receiving events?** Check Clerk webhook logs in dashboard
- **Signature verification fails?** Double-check `CLERK_WEBHOOK_SECRET` matches Clerk
- **Users not appearing in Supabase?** Check backend logs on Vercel
- **Backend needs SUPABASE_SERVICE_ROLE_KEY** - never expose this in mobile app


