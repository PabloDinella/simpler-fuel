import { RxDatabase, RxCollection, createRxDatabase } from 'rxdb/plugins/core';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { addRxPlugin } from 'rxdb/plugins/core';

// Types for our collections
export interface FuelEntry {
  id: string;
  date: string; // ISO timestamp
  odometer_km: number;
  liters: number;
  notes?: string;
  user_id?: string;
}

export interface Settings {
  id: string;
  distanceUnit: 'km' | 'mi';
  volumeUnit: 'L' | 'gal_us' | 'gal_uk';
  consumptionFormat: 'km_per_L' | 'L_per_100km' | 'mpg_us' | 'mpg_uk';
  language: string;
}

// RxDB Collection Types
export type FuelEntryCollection = RxCollection<FuelEntry>;
export type SettingsCollection = RxCollection<Settings>;

export interface DatabaseCollections {
  fuel_entries: FuelEntryCollection;
  settings: SettingsCollection;
}

export type Database = RxDatabase<DatabaseCollections>;

// Schemas
const fuelEntrySchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    date: {
      type: 'string',
      format: 'date-time'
    },
    odometer_km: {
      type: 'number',
      minimum: 0
    },
    liters: {
      type: 'number',
      minimum: 0
    },
    notes: {
      type: 'string'
    },
    user_id: {
      type: 'string'
    }
  },
  required: ['id', 'date', 'odometer_km', 'liters']
} as const;

const settingsSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    distanceUnit: {
      type: 'string',
      enum: ['km', 'mi']
    },
    volumeUnit: {
      type: 'string',
      enum: ['L', 'gal_us', 'gal_uk']
    },
    consumptionFormat: {
      type: 'string',
      enum: ['km_per_L', 'L_per_100km', 'mpg_us', 'mpg_uk']
    },
    language: {
      type: 'string'
    }
  },
  required: ['id', 'distanceUnit', 'volumeUnit', 'consumptionFormat', 'language']
} as const;

let dbInstance: Database | null = null;

// Enable required plugins
addRxPlugin(RxDBQueryBuilderPlugin);

// Enable dev-mode plugin in development
if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

export async function initDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  // Create RxDB database
  const db = await createRxDatabase<DatabaseCollections>({
    name: 'simplerfueldb',
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie()
    }),
    closeDuplicates: true // Allow hot reload in development
  });

  // Add collections
  await db.addCollections({
    fuel_entries: {
      schema: fuelEntrySchema
    },
    settings: {
      schema: settingsSchema
    }
  });

  // Initialize default settings if none exist
  const existingSettings = await db.settings.findOne().exec();
  if (!existingSettings) {
    await db.settings.insert({
      id: 'user-settings',
      distanceUnit: 'km',
      volumeUnit: 'L',
      consumptionFormat: 'km_per_L',
      language: 'en'
    });
  }

  dbInstance = db;
  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    return await initDatabase();
  }
  return dbInstance;
}

export async function destroyDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.remove();
    dbInstance = null;
  }
}
