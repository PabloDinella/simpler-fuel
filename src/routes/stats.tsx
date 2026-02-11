import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getDatabase, FuelEntry, Settings } from '../db';
import {
  calculateConsumption,
  getConsumptionFormatLabel,
  formatNumber,
  convertDistanceFromKm,
  convertVolumeFromLiters,
  getDistanceUnitLabel,
  getVolumeUnitLabel
} from '../lib/units';

export default function Stats() {
  const { t } = useTranslation();
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
        .sort({ date: 'asc' })
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

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (entries.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
              ← {t('nav.back')}
            </Link>
            <h1 className="text-2xl font-bold">{t('stats.title')}</h1>
          </div>
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">
              {t('stats.needMoreEntries')}
            </p>
            <Link
              to="/add"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {t('nav.addEntry')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate consumption data
  const consumptionData = calculateConsumption(entries, settings.consumptionFormat);

  // Calculate statistics
  const consumptionValues = consumptionData.map(c => c.value);
  const avgConsumption = consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length;
  const minConsumption = Math.min(...consumptionValues);
  const maxConsumption = Math.max(...consumptionValues);

  // Calculate total distance and fuel
  const totalDistanceKm = entries[entries.length - 1].odometer_km - entries[0].odometer_km;
  const totalFuelLiters = entries.slice(1).reduce((sum, entry) => sum + entry.liters, 0);

  const totalDistanceDisplay = convertDistanceFromKm(totalDistanceKm, settings.distanceUnit);
  const totalFuelDisplay = convertVolumeFromLiters(totalFuelLiters, settings.volumeUnit);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
            ← {t('nav.back')}
          </Link>
          <h1 className="text-2xl font-bold">{t('stats.title')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-600 mb-2">{t('stats.avgConsumption')}</h2>
            <p className="text-3xl font-bold text-blue-600">
              {formatNumber(avgConsumption)} <span className="text-lg">{getConsumptionFormatLabel(settings.consumptionFormat)}</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-600 mb-2">{t('stats.bestConsumption')}</h2>
            <p className="text-3xl font-bold text-green-600">
              {formatNumber(settings.consumptionFormat === 'L_per_100km' ? minConsumption : maxConsumption)}{' '}
              <span className="text-lg">{getConsumptionFormatLabel(settings.consumptionFormat)}</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-600 mb-2">{t('stats.totalDistance')}</h2>
            <p className="text-3xl font-bold text-gray-800">
              {formatNumber(totalDistanceDisplay, 0)} <span className="text-lg">{getDistanceUnitLabel(settings.distanceUnit)}</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-600 mb-2">{t('stats.totalFuel')}</h2>
            <p className="text-3xl font-bold text-gray-800">
              {formatNumber(totalFuelDisplay, 1)} <span className="text-lg">{getVolumeUnitLabel(settings.volumeUnit)}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{t('stats.consumptionHistory')}</h2>
          <div className="space-y-2">
            {consumptionData.map((data, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">
                  {new Date(data.date).toLocaleDateString()}
                </span>
                <span className="font-medium">
                  {formatNumber(data.value)} {getConsumptionFormatLabel(settings.consumptionFormat)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
