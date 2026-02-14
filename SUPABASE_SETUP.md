# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Set project name: `simpler-fuel`
5. Set a strong database password
6. Choose a region close to your users
7. Wait for the project to be created

## 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL

This will create:
- `vehicles` table with proper columns
- `fuel_entries` table with vehicle linkage
- Automatic `_modified` timestamp updates
- Realtime replication enabled
- Row Level Security (RLS) policies
- Performance indexes

If you already had a previous deployment without vehicles, run `supabase-migration-multi-vehicle.sql` first (or immediately after) to backfill each user's default `My Vehicle` and assign existing entries.

## 3. Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon public** key (safe to use in frontend)
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Enable Email Authentication (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if desired

## 5. Test the Setup

After completing the implementation steps in the app:
1. Sign up a test user
2. Create at least one vehicle in app settings (or use the auto-created default vehicle)
3. Add a fuel entry
4. Check both `vehicles` and `fuel_entries` tables in Supabase dashboard
5. Verify realtime sync by opening the app in two browser tabs

## Notes

- **Never commit** `.env` file to version control
- Add `.env` to your `.gitignore`
- The `anon` key is safe for frontend use (protected by RLS)
- Never expose your `service_role` key in the frontend
