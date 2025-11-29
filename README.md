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
- 👥 User types: Owners (agents), Renters (buyers), and Staff (admin)
- 🔄 Automatic user sync via webhooks
- ✅ Property status workflow (pending → online → expired)

## Property Status Workflow

Properties go through the following status lifecycle:

1. **`en_attente`** (Pending) - When a property is first submitted by an owner
   - Properties are created with this status automatically
   - Not visible to renters/buyers on the frontend
   - Requires staff approval via web app (to be built)

2. **`en_ligne`** (Online) - After staff approval
   - Properties become visible on the frontend
   - Only properties with this status should be displayed to users
   - Set by staff through the admin web app

3. **`expired`** (Expired) - When a property is rented/sold
   - Used when a renter is found for the property
   - Set by staff through the admin web app
   - Removes property from active listings

### Implementation Notes

- **Backend**: Properties are created with `status: "en_attente"` in `/roogo-web/app/api/properties/route.ts`
- **Frontend**: When fetching properties from the API, filter by `status === "en_ligne"` to show only approved listings
- **Current State**: The app currently uses mock data. When integrating real API calls, ensure status filtering is implemented.

## Staff System

The app includes a staff/admin system for managing properties and users. Staff users have elevated permissions to manage all properties regardless of ownership.

### Staff User Type

Staff users are identified by `user_type = 'staff'` in the Supabase `users` table. They can:

- View and manage all properties (create, update, delete)
- View and manage all users
- Approve properties (change status from `en_attente` to `en_ligne`)
- Mark properties as expired (change status to `expired`)

### Staff-Related Code Locations

1. **Database Permissions** (`supabase/staff_permissions_migration.sql`)
   - RLS policies that grant staff users admin access
   - Helper function `is_staff()` to check staff status
   - Policies for properties, users, and property_images tables

2. **Backend** (`roogo-web/`)
   - `lib/user-sync.ts` - Validates `userType: "staff"` in Clerk metadata
   - Webhook handler syncs staff users to Supabase

3. **Documentation**
   - `roogo-web/STAFF_SETUP.md` - Instructions for creating staff users
   - `roogo-web/USER_TYPES.md` - User type documentation including staff

### Creating Staff Users

Staff users are created through Clerk:

1. Set `userType: "staff"` in the user's metadata in Clerk dashboard
2. The webhook automatically syncs this to Supabase with `user_type = 'staff'`
3. Staff users should access the web app (to be built) for admin tasks

**Note**: The web app for staff to manage properties is planned but not yet built. Staff functionality is currently limited to database-level permissions.
