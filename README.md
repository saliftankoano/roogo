# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

## Project Structure

- **`app/`** - Expo Router pages and components
- **`supabase/`** - Database schema and migration files
- **`CLERK_WEBHOOK_SETUP.md`** - Instructions for setting up Clerk webhooks

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (create `.env`):
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   ```

3. Run the database migration in Supabase:
   - See `supabase/migration_update_schema.sql`

4. Set up storage bucket:
   - See `supabase/STORAGE_SETUP.md`

5. Configure Clerk webhooks:
   - See `CLERK_WEBHOOK_SETUP.md`
   - Uses `roogo-backend` repository for webhook handling

6. Start the app:
   ```bash
   npx expo start
   ```

## Key Features

- 🔐 Clerk authentication
- 🏠 Property listings (create, view, favorite)
- 📸 Image uploads to Supabase Storage
- 👥 User types: Owners (agents) and Renters (buyers)
- 🔄 Automatic user sync via webhooks
