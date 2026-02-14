import { getDatabase, Settings, Vehicle } from '../db';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function getOrCreateDefaultVehicleId(): Promise<string> {
  const db = await getDatabase();

  const existingVehicles = await db.vehicles
    .find({
      selector: {
        is_archived: false
      }
    })
    .sort({ created_at: 'asc' })
    .exec();

  if (existingVehicles.length > 0) {
    return (existingVehicles[0].toJSON() as Vehicle).id;
  }

  const defaultId = createId();
  await db.vehicles.insert({
    id: defaultId,
    name: 'My Vehicle',
    notes: undefined,
    is_archived: false,
    created_at: new Date().toISOString()
  });

  return defaultId;
}

export async function bootstrapVehicleData(): Promise<void> {
  const db = await getDatabase();
  const settingsDoc = await db.settings.findOne('user-settings').exec();

  if (!settingsDoc) {
    throw new Error('Settings document not found');
  }

  const settings = settingsDoc.toJSON() as Settings;
  const defaultVehicleId = await getOrCreateDefaultVehicleId();

  let activeVehicleId = settings.activeVehicleId;
  if (!activeVehicleId) {
    activeVehicleId = defaultVehicleId;
  } else {
    const activeVehicleDoc = await db.vehicles.findOne(activeVehicleId).exec();
    if (!activeVehicleDoc) {
      activeVehicleId = defaultVehicleId;
    } else {
      const activeVehicle = activeVehicleDoc.toJSON() as Vehicle;
      if (activeVehicle.is_archived) {
        activeVehicleId = defaultVehicleId;
      }
    }
  }

  if (activeVehicleId !== settings.activeVehicleId) {
    await settingsDoc.update({
      $set: {
        activeVehicleId
      }
    });
  }

  const allEntries = await db.fuel_entries.find().exec();
  for (const entryDoc of allEntries) {
    const entry = entryDoc.toJSON() as any;
    if (!entry.vehicle_id) {
      await entryDoc.update({
        $set: {
          vehicle_id: activeVehicleId
        }
      });
    }
  }
}
