import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { signOut, getAuthState } from '../lib/auth';
import { getDatabase, FuelEntry, Settings, Vehicle } from '../db';
import {
  IconGasStation,
  IconPlus,
  IconSettings,
  IconTrash
} from '@tabler/icons-react';
import {
  convertDistanceFromKm,
  convertVolumeFromLiters,
  calculateConsumption,
  getDistanceUnitLabel,
  getVolumeUnitLabel,
  getConsumptionFormatLabel,
  formatNumber
} from '../lib/units';

export default function Dashboard() {
  const { t } = useTranslation();
  const authState = getAuthState();
  const isLoggedIn = !!authState.user;
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settingsSubscription: any;
    let vehiclesSubscription: any;

    getDatabase().then(async (db) => {
      settingsSubscription = db.settings.findOne().$.subscribe((doc: any) => {
        if (doc) {
          const settingsData = doc.toJSON() as Settings;
          setSettings(settingsData);
          setActiveVehicleId(settingsData.activeVehicleId);
        }
      });

      vehiclesSubscription = db.vehicles
        .find({
          selector: {
            is_archived: false
          }
        })
        .sort({ created_at: 'asc' })
        .$
        .subscribe((docs: any[]) => {
          setVehicles(docs.map((doc) => doc.toJSON() as Vehicle));
        });
    });

    return () => {
      if (settingsSubscription) settingsSubscription.unsubscribe();
      if (vehiclesSubscription) vehiclesSubscription.unsubscribe();
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
        .sort({ date: 'desc' })
        .$
        .subscribe((docs: any[]) => {
          setEntries(docs.map((doc) => doc.toJSON() as FuelEntry));
          setLoading(false);
        });
    });

    return () => {
      if (entriesSubscription) entriesSubscription.unsubscribe();
    };
  }, [activeVehicleId]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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

  const handleActiveVehicleChange = async (vehicleId: string) => {
    try {
      const db = await getDatabase();
      const settingsDoc = await db.settings.findOne('user-settings').exec();
      if (!settingsDoc) return;

      await settingsDoc.update({
        $set: {
          activeVehicleId: vehicleId
        }
      });
    } catch (error) {
      console.error('Error changing active vehicle:', error);
      alert(t('vehicles.switchFailed'));
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  const activeVehicle =
    vehicles.find((vehicle) => vehicle.id === activeVehicleId) || null;

  const consumptionData = calculateConsumption(
    entries,
    settings.consumptionFormat
  );
  const consumptionMap = new Map(consumptionData.map((c) => [c.date, c.value]));

  let stats = null;
  if (entries.length >= 2) {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const consumptionValues = consumptionData.map((c) => c.value);
    const avgConsumption =
      consumptionValues.reduce((a, b) => a + b, 0) / consumptionValues.length;
    const bestConsumption =
      settings.consumptionFormat === 'L_per_100km'
        ? Math.min(...consumptionValues)
        : Math.max(...consumptionValues);
    const totalDistanceKm =
      sortedEntries[sortedEntries.length - 1].odometer_km -
      sortedEntries[0].odometer_km;
    const totalFuelLiters = sortedEntries
      .slice(1)
      .reduce((sum, entry) => sum + entry.liters, 0);

    stats = {
      avgConsumption,
      bestConsumption,
      totalDistance: convertDistanceFromKm(
        totalDistanceKm,
        settings.distanceUnit
      ),
      totalFuel: convertVolumeFromLiters(totalFuelLiters, settings.volumeUnit)
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <IconGasStation
              size={32}
              className="text-blue-600 dark:text-blue-400"
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('app.title')}
            </h1>
            {!isLoggedIn && (
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                {t('app.localOnly')}
              </span>
            )}
          </div>
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t('auth.signOut')}
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              {t('auth.signIn')}
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('dashboard.activeVehicle')}
              </h2>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeVehicle?.name || t('vehicles.noneAvailable')}
              </p>
            </div>
            <div className="w-full md:w-80">
              <label
                htmlFor="dashboard-vehicle"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('vehicles.selectVehicle')}
              </label>
              <select
                id="dashboard-vehicle"
                value={activeVehicleId}
                onChange={(e) => handleActiveVehicleChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/add"
            className="bg-blue-600 dark:bg-blue-700 text-white p-6 rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <div className="mb-2">
              <IconPlus size={32} />
            </div>
            <h2 className="text-lg font-semibold">{t('nav.addEntry')}</h2>
            <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">
              {t('dashboard.addEntryDesc')}
            </p>
          </Link>

          <Link
            to="/settings"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="mb-2 text-gray-900 dark:text-white">
              <IconSettings size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('nav.settings')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {t('dashboard.settingsDesc')}
            </p>
          </Link>
        </div>

        {stats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('stats.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t('stats.avgConsumption')}
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(stats.avgConsumption)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getConsumptionFormatLabel(settings.consumptionFormat)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t('stats.bestConsumption')}
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatNumber(stats.bestConsumption)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getConsumptionFormatLabel(settings.consumptionFormat)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t('stats.totalDistance')}
                </h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {formatNumber(stats.totalDistance, 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getDistanceUnitLabel(settings.distanceUnit)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {t('stats.totalFuel')}
                </h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {formatNumber(stats.totalFuel, 1)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getVolumeUnitLabel(settings.volumeUnit)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('history.title')}
          </h2>

          {entries.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('history.noEntriesForVehicle', {
                  vehicle: activeVehicle?.name || ''
                })}
              </p>
              <Link
                to="/add"
                className="inline-block bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                {t('history.addFirst')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
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
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          {consumption && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                              {formatNumber(consumption)}{' '}
                              {getConsumptionFormatLabel(
                                settings.consumptionFormat
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">
                              {t('entry.odometer')}:
                            </span>{' '}
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
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{t('entry.notes')}:</span>{' '}
                            {entry.notes}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-4"
                        title={t('entry.delete')}
                      >
                        <IconTrash size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
