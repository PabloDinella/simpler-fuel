import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { replicateSupabase } from 'rxdb/plugins/replication-supabase';
import { Database, FuelEntryCollection } from './index';
import type { RxSupabaseReplicationState } from 'rxdb/plugins/replication-supabase';

let supabaseClient: SupabaseClient | null = null;
let replicationState: RxSupabaseReplicationState<any> | null = null;

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
): Promise<RxSupabaseReplicationState<any>> {
  // Stop existing replication if any
  if (replicationState) {
    await replicationState.cancel();
  }

  const supabase = getSupabaseClient();
  const collection = db.fuel_entries;

  replicationState = replicateSupabase({
    collection: collection as FuelEntryCollection,
    client: supabase,
    tableName: 'fuel_entries',
    replicationIdentifier: `fuel-entries-${userId}`,
    live: true,
    pull: {
      batchSize: 50,
      modifier: (doc: any) => {
        // Handle nullable fields - convert null to undefined
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
        // Ensure user_id is set on push
        return {
          ...doc,
          user_id: userId
        };
      }
    }
  });

  // Log replication errors
  replicationState.error$.subscribe((error: any) => {
    console.error('[Replication Error]', error);
  });

  // Wait for initial sync
  try {
    await replicationState.awaitInitialReplication();
    console.log('[Replication] Initial sync complete');
  } catch (error) {
    console.error('[Replication] Initial sync failed', error);
  }

  return replicationState;
}

export function getReplicationState(): RxSupabaseReplicationState<any> | null {
  return replicationState;
}

export async function stopReplication(): Promise<void> {
  if (replicationState) {
    await replicationState.cancel();
    replicationState = null;
  }
}
