import { RxDatabase, RxCollection, createRxDatabase } from 'rxdb/plugins/core';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { addRxPlugin } from 'rxdb/plugins/core';

// Types for our collections
export interface FuelEntry {
  id: string;
  vehicle_id: string;
  date: string; // ISO timestamp
  odometer_km: number;
  liters: number;
  notes?: string;
  user_id?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  notes?: string;
  is_archived: boolean;
  created_at: string; // ISO timestamp
  user_id?: string;
}

export interface Settings {
  id: string;
  distanceUnit: 'km' | 'mi';
  volumeUnit: 'L' | 'gal_us' | 'gal_uk';
  consumptionFormat: 'km_per_L' | 'L_per_100km' | 'mpg_us' | 'mpg_uk';
  language: string;
  theme: 'light' | 'dark' | 'system';
  activeVehicleId: string;
}

// RxDB Collection Types
export type FuelEntryCollection = RxCollection<FuelEntry>;
export type VehicleCollection = RxCollection<Vehicle>;
export type SettingsCollection = RxCollection<Settings>;

export interface DatabaseCollections {
  fuel_entries: FuelEntryCollection;
  vehicles: VehicleCollection;
  settings: SettingsCollection;
}

export type Database = RxDatabase<DatabaseCollections>;

// Schemas
const fuelEntrySchema = {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    vehicle_id: {
      type: 'string'
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
  required: ['id', 'vehicle_id', 'date', 'odometer_km', 'liters']
} as const;

const vehicleSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    notes: {
      type: 'string'
    },
    is_archived: {
      type: 'boolean'
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    },
    user_id: {
      type: 'string'
    }
  },
  required: ['id', 'name', 'is_archived', 'created_at']
} as const;

const settingsSchema = {
  version: 2,
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
    },
    theme: {
      type: 'string',
      enum: ['light', 'dark', 'system']
    },
    activeVehicleId: {
      type: 'string'
    }
  },
  required: ['id', 'distanceUnit', 'volumeUnit', 'consumptionFormat', 'language', 'theme', 'activeVehicleId']
} as const;

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

// Enable required plugins
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBUpdatePlugin);

// Enable dev-mode plugin in development
if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

export async function initDatabase(): Promise<Database> {
  // Return existing instance if already created
  if (dbInstance) {
    return dbInstance;
  }

  // If already initializing, wait for that promise
  if (initPromise) {
    return initPromise;
  }

  // Create new initialization promise
  initPromise = (async () => {
    try {
      console.log('[DB] Starting database initialization...');
      
      // Create RxDB database
      const db = await createRxDatabase<DatabaseCollections>({
        name: 'simplerfueldb',
        storage: wrappedValidateAjvStorage({
          storage: getRxStorageDexie()
        }),
        ignoreDuplicate: import.meta.env.DEV // Only ignore duplicates in development
      });

      console.log('[DB] Database created, adding collections...');

      // Add collections
      await db.addCollections({
        fuel_entries: {
          schema: fuelEntrySchema,
          migrationStrategies: {
            1: function(oldDoc: any) {
              return {
                ...oldDoc,
                vehicle_id: oldDoc.vehicle_id ?? ''
              };
            }
          }
        },
        vehicles: {
          schema: vehicleSchema
        },
        settings: {
          schema: settingsSchema,
          migrationStrategies: {
            // Migration from version 0 to version 1: add theme field
            1: function(oldDoc: any) {
              return {
                ...oldDoc,
                theme: 'dark' // Default to dark theme
              };
            },
            // Migration from version 1 to version 2: add active vehicle id
            2: function(oldDoc: any) {
              return {
                ...oldDoc,
                activeVehicleId: oldDoc.activeVehicleId ?? ''
              };
            }
          }
        }
      });

      console.log('[DB] Collections added, initializing default settings...');

      // Initialize default settings if none exist
      const existingSettings = await db.settings.findOne().exec();
      if (!existingSettings) {
        await db.settings.insert({
          id: 'user-settings',
          distanceUnit: 'km',
          volumeUnit: 'L',
          consumptionFormat: 'km_per_L',
          language: 'en',
          theme: 'dark',
          activeVehicleId: ''
        });
        console.log('[DB] Default settings created');
      } else {
        console.log('[DB] Existing settings found');
      }

      dbInstance = db;
      console.log('[DB] Database initialization complete');
      return db;
    } catch (error) {
      console.error('[DB] Database initialization failed:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
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
