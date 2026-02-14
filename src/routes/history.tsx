import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeVehicleId, setActiveVehicleId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settingsSubscription: any;

    getDatabase().then(async (db) => {
      settingsSubscription = db.settings.findOne().$.subscribe((doc: any) => {
        if (doc) {
          const settingsData = doc.toJSON() as Settings;
          setSettings(settingsData);
          setActiveVehicleId(settingsData.activeVehicleId);
        }
      });
    });

    return () => {
      if (settingsSubscription) settingsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let entriesSubscription: any;

    if (!activeVehicleId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getDatabase().then(async (db) => {
      entriesSubscription = db.fuel_entries
        .find({
          selector: {
            vehicle_id: activeVehicleId
          }
        })
        .sort({ odometer_km: 'desc' })
        .$
        .subscribe((docs: any[]) => {
          const sortedEntries = docs
            .map((doc) => doc.toJSON() as FuelEntry)
            .sort(
              (a, b) =>
                b.odometer_km - a.odometer_km
            );
          setEntries(sortedEntries);
          setLoading(false);
        });
    });

    return () => {
      if (entriesSubscription) entriesSubscription.unsubscribe();
    };
  }, [activeVehicleId]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('entry.confirmDelete'))) return;

    try {
      const db = await getDatabase();
      const doc = await db.fuel_entries.findOne(id).exec();
      if (doc) {
        await doc.remove();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert(t('entry.deleteFailed'));
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  const consumptionData = calculateConsumption(entries, settings.consumptionFormat);
  const consumptionMap = new Map(consumptionData.map((c) => [c.date, c.value]));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center pt-6">
            <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
              ← {t('nav.back')}
            </Link>
            <h1 className="text-2xl font-bold">{t('history.title')}</h1>
          </div>
          <Link
            to="/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + {t('nav.addEntry')}
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">{t('history.noEntries')}</p>
            <Link
              to="/add"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {t('history.addFirst')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const odometerDisplay = convertDistanceFromKm(
                entry.odometer_km,
                settings.distanceUnit
              );
              const fuelDisplay = convertVolumeFromLiters(
                entry.liters,
                settings.volumeUnit
              );
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
                            {formatNumber(consumption)}{' '}
                            {getConsumptionFormatLabel(settings.consumptionFormat)}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{t('entry.odometer')}:</span>{' '}
                          {formatNumber(odometerDisplay)}{' '}
                          {getDistanceUnitLabel(settings.distanceUnit)}
                        </div>
                        <div>
                          <span className="font-medium">{t('entry.fuel')}:</span>{' '}
                          {formatNumber(fuelDisplay, 3)}{' '}
                          {getVolumeUnitLabel(settings.volumeUnit)}
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">{t('entry.notes')}:</span>{' '}
                          {entry.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                      title={t('entry.delete')}
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
