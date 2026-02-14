import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { replicateSupabase } from 'rxdb/plugins/replication-supabase';
import { Database, FuelEntryCollection, VehicleCollection } from './index';
import type { RxSupabaseReplicationState } from 'rxdb/plugins/replication-supabase';

let supabaseClient: SupabaseClient | null = null;
let fuelEntriesReplicationState: RxSupabaseReplicationState<any> | null = null;
let vehiclesReplicationState: RxSupabaseReplicationState<any> | null = null;

function extractErrorText(error: any): string {
  if (!error) return 'Unknown replication error';

  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function formatReplicationSetupError(error: any): string {
  const raw = extractErrorText(error);
  const normalized = raw.toLowerCase();

  const missingTables =
    normalized.includes('pgrst205') ||
    normalized.includes('schema cache') ||
    (normalized.includes('relation') && normalized.includes('does not exist')) ||
    (normalized.includes('table') &&
      normalized.includes('does not exist') &&
      (normalized.includes('vehicles') || normalized.includes('fuel_entries')));

  if (missingTables) {
    return 'Supabase tables are missing. Run supabase-schema.sql in your Supabase SQL Editor, then restart the app.';
  }

  return `Supabase replication setup failed: ${raw}`;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
      );
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

export async function setupReplication(
  db: Database,
  userId: string
): Promise<{
  fuelEntries: RxSupabaseReplicationState<any>;
  vehicles: RxSupabaseReplicationState<any>;
}> {
  await stopReplication();

  const supabase = getSupabaseClient();

  fuelEntriesReplicationState = replicateSupabase({
    collection: db.fuel_entries as FuelEntryCollection,
    client: supabase,
    tableName: 'fuel_entries',
    replicationIdentifier: `fuel-entries-${userId}`,
    live: true,
    pull: {
      batchSize: 50,
      modifier: (doc: any) => {
        if (doc.notes === null) {
          delete doc.notes;
        }
        if (doc.user_id === null) {
          delete doc.user_id;
        }
        return doc;
      }
    },
    push: {
      batchSize: 50,
      modifier: (doc: any) => {
        return {
          ...doc,
          user_id: userId
        };
      }
    }
  });

  vehiclesReplicationState = replicateSupabase({
    collection: db.vehicles as VehicleCollection,
    client: supabase,
    tableName: 'vehicles',
    replicationIdentifier: `vehicles-${userId}`,
    live: true,
    pull: {
      batchSize: 50,
      modifier: (doc: any) => {
        if (doc.notes === null) {
          delete doc.notes;
        }
        if (doc.user_id === null) {
          delete doc.user_id;
        }
        return doc;
      }
    },
    push: {
      batchSize: 50,
      modifier: (doc: any) => {
        return {
          ...doc,
          user_id: userId
        };
      }
    }
  });

  fuelEntriesReplicationState.error$.subscribe((error: any) => {
    console.error('[Replication Error]', error);
  });
  vehiclesReplicationState.error$.subscribe((error: any) => {
    console.error('[Replication Error]', error);
  });

  try {
    await Promise.all([
      fuelEntriesReplicationState.awaitInitialReplication(),
      vehiclesReplicationState.awaitInitialReplication()
    ]);
    console.log('[Replication] Initial sync complete');
  } catch (error) {
    console.error('[Replication] Initial sync failed', error);
    const setupError = formatReplicationSetupError(error);
    await stopReplication();
    throw new Error(setupError);
  }

  return {
    fuelEntries: fuelEntriesReplicationState,
    vehicles: vehiclesReplicationState
  };
}

export function getReplicationState():
  | {
      fuelEntries: RxSupabaseReplicationState<any> | null;
      vehicles: RxSupabaseReplicationState<any> | null;
    }
  | null {
  if (!fuelEntriesReplicationState && !vehiclesReplicationState) {
    return null;
  }

  return {
    fuelEntries: fuelEntriesReplicationState,
    vehicles: vehiclesReplicationState
  };
}

export async function stopReplication(): Promise<void> {
  if (fuelEntriesReplicationState) {
    await fuelEntriesReplicationState.cancel();
    fuelEntriesReplicationState = null;
  }

  if (vehiclesReplicationState) {
    await vehiclesReplicationState.cancel();
    vehiclesReplicationState = null;
  }
}
