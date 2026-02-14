import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getDatabase, Settings, FuelEntry, Vehicle } from '../db';
import { getAuthState } from '../lib/auth';
import {
  convertDistanceToKm,
  convertVolumeToLiters,
  convertDistanceFromKm,
  getDistanceUnitLabel,
  getVolumeUnitLabel,
  formatNumber
} from '../lib/units';

export default function AddEntry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [lastOdometer, setLastOdometer] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLastOdometer = async (vehicleId: string, settingsData: Settings) => {
    const db = await getDatabase();
    const lastEntry = await db.fuel_entries
      .findOne({
        selector: {
          vehicle_id: vehicleId
        }
      })
      .sort({ odometer_km: 'desc' })
      .exec();

    if (!lastEntry) {
      setLastOdometer(null);
      return;
    }

    const entry = lastEntry.toJSON() as FuelEntry;
    const lastOdometerInUserUnits = convertDistanceFromKm(
      entry.odometer_km,
      settingsData.distanceUnit
    );
    setLastOdometer(lastOdometerInUserUnits);
  };

  useEffect(() => {
    getDatabase().then(async (db) => {
      const userSettings = await db.settings.findOne().exec();
      if (!userSettings) return;

      const settingsData = userSettings.toJSON() as Settings;
      setSettings(settingsData);

      const vehicleDocs = await db.vehicles
        .find({
          selector: {
            is_archived: false
          }
        })
        .sort({ created_at: 'asc' })
        .exec();
      const vehicleData = vehicleDocs.map((doc) => doc.toJSON() as Vehicle);
      setVehicles(vehicleData);

      const initialVehicleId =
        settingsData.activeVehicleId || vehicleData[0]?.id || '';
      setSelectedVehicleId(initialVehicleId);
    });
  }, []);

  useEffect(() => {
    if (!settings || !selectedVehicleId) return;
    setOdometer('');
    loadLastOdometer(selectedVehicleId, settings);
  }, [settings, selectedVehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const db = await getDatabase();
      const authState = getAuthState();

      if (!settings) {
        throw new Error('Settings not loaded');
      }
      if (!selectedVehicleId) {
        throw new Error('Vehicle not selected');
      }
      const odometerValue = parseFloat(odometer);
      if (!Number.isFinite(odometerValue)) {
        throw new Error('Invalid odometer value');
      }

      // Convert to base units (km, liters)
      const odometerKm = convertDistanceToKm(
        odometerValue,
        settings.distanceUnit
      );
      const liters = convertVolumeToLiters(
        parseFloat(fuel),
        settings.volumeUnit
      );

      const latestEntry = await db.fuel_entries
        .findOne({
          selector: {
            vehicle_id: selectedVehicleId
          }
        })
        .sort({ odometer_km: 'desc' })
        .exec();

      if (latestEntry) {
        const latestOdometerKm = (latestEntry.toJSON() as FuelEntry).odometer_km;
        if (odometerKm < latestOdometerKm) {
          const latestInUserUnits = convertDistanceFromKm(
            latestOdometerKm,
            settings.distanceUnit
          );
          alert(
            t('entry.odometerLowerThanLast', {
              value: formatNumber(latestInUserUnits),
              unit: getDistanceUnitLabel(settings.distanceUnit)
            })
          );
          setLoading(false);
          return;
        }
      }

      await db.fuel_entries.insert({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        vehicle_id: selectedVehicleId,
        date: new Date(date).toISOString(),
        odometer_km: odometerKm,
        liters: liters,
        notes: notes || undefined,
        user_id: authState.user?.id // Optional - only set if logged in
      });

      navigate({ to: '/' });
    } catch (error) {
      console.error('Error adding entry:', error);
      alert(t('entry.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6 pt-6">
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
          >
            ← {t('nav.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('entry.add')}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4"
        >
          <div>
            <label
              htmlFor="vehicle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('vehicles.selectVehicle')}
            </label>
            <select
              id="vehicle"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('entry.date')}
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="odometer"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('entry.odometer')} ({getDistanceUnitLabel(settings.distanceUnit)})
            </label>
            <input
              id="odometer"
              type="number"
              step="0.01"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              required
              min={lastOdometer ?? 0}
              placeholder="e.g., 10000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {lastOdometer !== null && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('entry.lastRecorded')}: {formatNumber(lastOdometer)}{' '}
                {getDistanceUnitLabel(settings.distanceUnit)}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fuel"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('entry.fuel')} ({getVolumeUnitLabel(settings.volumeUnit)})
            </label>
            <input
              id="fuel"
              type="number"
              step="0.001"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              required
              min="0"
              placeholder="e.g., 40"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('entry.notesOptional')}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('entry.notesPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? t('entry.saving') : t('entry.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
