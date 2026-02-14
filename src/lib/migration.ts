import { getDatabase } from '../db';
import { setupReplication } from '../db/replication';

/**
 * Migrate local fuel entries to cloud when user signs up or logs in
 * This ensures existing local data is synced to Supabase
 */
export async function migrateLocalDataToCloud(userId: string): Promise<void> {
  try {
    const db = await getDatabase();

    const localVehicles = await db.vehicles
      .find({
        selector: {
          user_id: { $exists: false }
        }
      })
      .exec();

    for (const vehicle of localVehicles) {
      await vehicle.update({
        $set: {
          user_id: userId
        }
      });
    }
    
    // Get all local entries that don't have a user_id yet
    const localEntries = await db.fuel_entries
      .find({
        selector: {
          user_id: { $exists: false }
        }
      })
      .exec();

    console.log(`[Migration] Found ${localEntries.length} local entries to migrate`);

    if (localEntries.length === 0) {
      console.log('[Migration] No local entries to migrate');
      return;
    }

    for (const entry of localEntries) {
      const data = entry.toJSON() as any;
      if (!data.vehicle_id) {
        throw new Error('Cannot migrate entry without vehicle_id');
      }
    }

    // Update all local entries to include user_id
    for (const entry of localEntries) {
      await entry.update({
        $set: {
          user_id: userId
        }
      });
    }

    console.log(`[Migration] Successfully migrated ${localEntries.length} entries`);

    // Now setup replication - it will automatically push the updated entries
    await setupReplication(db, userId);
    
    console.log('[Migration] Replication started - data will sync to cloud');
  } catch (error) {
    console.error('[Migration] Error migrating local data:', error);
    throw error;
  }
}

/**
 * Check if user has any local entries that need migration
 */
export async function hasLocalEntries(): Promise<boolean> {
  try {
    const db = await getDatabase();
    
    const entries = await db.fuel_entries
      .find({
        selector: {
          user_id: { $exists: false }
        }
      })
      .exec();

    return entries.length > 0;
  } catch (error) {
    console.error('[Migration] Error checking local entries:', error);
    return false;
  }
}
