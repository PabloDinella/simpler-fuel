# Plan: Fuel Consumption Monitoring App

Build a cross-platform fuel tracking app with offline-first architecture using Tauri, React, TanStack Router, RxDB with Supabase replication, and i18n. Start with web/desktop, add mobile later. Users log odometer readings and fuel amounts to track consumption with offline capability and automatic cloud sync.

## Steps

1. **Install core dependencies and setup project structure**: Add `rxdb`, `@supabase/supabase-js`, `@tanstack/react-router`, `react-i18next`, Tailwind CSS, and shadcn/ui to package.json. Create folder structure: src/db/, src/routes/, src/components/, src/lib/, src/i18n/.

2. **Configure Supabase backend with required schema**: Create Supabase project, setup `fuel_entries` table with `id` (text PK), `date`, `odometer_km` (numeric, stored in km), `liters` (numeric, stored in L), `notes`, `user_id`, `_deleted` (boolean), `_modified` (timestamp with auto-update trigger). Enable Realtime on table and configure RLS policies for user isolation.

3. **Setup RxDB with Supabase replication**: Create RxDB database in src/db/index.ts using Dexie storage adapter, define `fuel_entries` collection schema matching Supabase table, initialize `replicateSupabase()` with pull/push config, handle nullable fields in modifier, and expose replication state for UI feedback.

4. **Implement authentication and routing**: Setup Supabase auth in src/lib/auth.ts with email/password and social providers, create TanStack Router file-based routes for `/login`, `/dashboard`, `/add`, `/history`, `/stats`, `/settings`, add route guards for authenticated pages, connect auth state to RxDB replication.

5. **Build unit conversion system and core UI**: Create conversion utilities in src/lib/units.ts for distance (km↔mi) and volume (L↔gal US/UK), fuel entry form that converts user input to base units (km, L) before saving, history list that converts from base units to user preference for display, and statistics dashboard showing consumption in selected format (km/L, L/100km, mpg US/UK).

6. **Add i18n and settings persistence**: Setup i18next with namespaces in src/i18n/config.ts, add English and one additional language, create settings page with dropdowns for distance unit, volume unit, consumption display format, and language. Store preferences in RxDB `settings` collection (local only, no sync).

## Further Considerations

1. **Base unit standardization**: Store all distances in kilometers and volumes in liters. Supported display units: distance (km/mi), volume (L/gal US/gal UK), consumption (km/L, L/100km, mpg US, mpg UK). This ensures consistent calculations regardless of user preference.

2. **Conversion precision**: Use sufficient decimal places during conversion (e.g., 1 mile = 1.609344 km) to minimize rounding errors. Display formatted values with 1-2 decimals for readability.

3. **Migration consideration**: If user changes preferred units mid-usage, only display changes - stored data remains in base units. No data migration needed.
