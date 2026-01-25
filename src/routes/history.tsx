import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { getDatabase, FuelEntry, Settings } from '../db';
import {
  convertDistanceFromKm,
  convertVolumeFromLiters,
  calculateConsumption,
  getDistanceUnitLabel,
  getVolumeUnitLabel,
  getConsumptionFormatLabel,
  formatNumber
} from '../lib/units';

export default function History() {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    getDatabase().then(async (db) => {
      // Load settings
      const userSettings = await db.settings.findOne().exec();
      if (userSettings) {
        setSettings(userSettings.toJSON() as Settings);
      }

      // Subscribe to fuel entries
      subscription = db.fuel_entries
        .find()
        .sort({ date: 'desc' })
        .$
        .subscribe((docs: any[]) => {
          setEntries(docs.map(doc => doc.toJSON() as FuelEntry));
          setLoading(false);
        });
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const db = await getDatabase();
      const doc = await db.fuel_entries.findOne(id).exec();
      if (doc) {
        await doc.remove();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Calculate consumption for each entry
  const consumptionData = calculateConsumption(entries, settings.consumptionFormat);
  const consumptionMap = new Map(consumptionData.map(c => [c.date, c.value]));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center pt-6">
            <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">Fuel History</h1>
          </div>
          <Link
            to="/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Entry
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">No fuel entries yet</p>
            <Link
              to="/add"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Add Your First Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const odometerDisplay = convertDistanceFromKm(entry.odometer_km, settings.distanceUnit);
              const fuelDisplay = convertVolumeFromLiters(entry.liters, settings.volumeUnit);
              const consumption = consumptionMap.get(entry.date);

              return (
                <div key={entry.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-semibold">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        {consumption && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {formatNumber(consumption)} {getConsumptionFormatLabel(settings.consumptionFormat)}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Odometer:</span>{' '}
                          {formatNumber(odometerDisplay)} {getDistanceUnitLabel(settings.distanceUnit)}
                        </div>
                        <div>
                          <span className="font-medium">Fuel:</span>{' '}
                          {formatNumber(fuelDisplay, 3)} {getVolumeUnitLabel(settings.volumeUnit)}
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {entry.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
