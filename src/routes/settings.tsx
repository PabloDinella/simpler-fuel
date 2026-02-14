import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getDatabase, Settings, Vehicle } from '../db';
import { signOut, getAuthState } from '../lib/auth';
import type { DistanceUnit, VolumeUnit, ConsumptionFormat } from '../lib/units';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const authState = getAuthState();
  const isLoggedIn = !!authState.user;
  const [settings, setSettings] = useState<Settings | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehicleNotes, setNewVehicleNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAccountBenefits, setShowAccountBenefits] = useState(false);

  useEffect(() => {
    let settingsSubscription: any;
    let vehiclesSubscription: any;

    getDatabase().then(async (db) => {
      settingsSubscription = db.settings.findOne().$.subscribe((doc: any) => {
        if (doc) {
          setSettings(doc.toJSON() as Settings);
          setLoading(false);
        }
      });

      vehiclesSubscription = db.vehicles
        .find()
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

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const db = await getDatabase();
      const doc = await db.settings.findOne(settings.id).exec();
      if (doc) {
        await doc.update({
          $set: {
            distanceUnit: settings.distanceUnit,
            volumeUnit: settings.volumeUnit,
            consumptionFormat: settings.consumptionFormat,
            language: settings.language,
            theme: settings.theme
          }
        });
      }
      alert(
        t('settings.saveSettings') + ' ' + t('common.success').toLowerCase() + '!'
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!settings) return;

    const name = newVehicleName.trim();
    if (!name) {
      alert(t('vehicles.nameRequired'));
      return;
    }

    try {
      const db = await getDatabase();
      const id = createId();

      await db.vehicles.insert({
        id,
        name,
        notes: newVehicleNotes.trim() || undefined,
        is_archived: false,
        created_at: new Date().toISOString(),
        user_id: authState.user?.id
      });

      if (!settings.activeVehicleId) {
        const settingsDoc = await db.settings.findOne(settings.id).exec();
        if (settingsDoc) {
          await settingsDoc.update({
            $set: {
              activeVehicleId: id
            }
          });
        }
      }

      setNewVehicleName('');
      setNewVehicleNotes('');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert(t('vehicles.createFailed'));
    }
  };

  const handleSetActiveVehicle = async (vehicleId: string) => {
    if (!settings) return;

    try {
      const db = await getDatabase();
      const settingsDoc = await db.settings.findOne(settings.id).exec();
      if (!settingsDoc) return;

      await settingsDoc.update({
        $set: {
          activeVehicleId: vehicleId
        }
      });
    } catch (error) {
      console.error('Error setting active vehicle:', error);
      alert(t('vehicles.switchFailed'));
    }
  };

  const handleArchiveVehicle = async (vehicle: Vehicle) => {
    if (!settings) return;

    const nonArchivedVehicles = vehicles.filter((v) => !v.is_archived);
    if (nonArchivedVehicles.length <= 1) {
      alert(t('vehicles.cannotArchiveLast'));
      return;
    }

    try {
      const db = await getDatabase();
      const vehicleDoc = await db.vehicles.findOne(vehicle.id).exec();
      if (!vehicleDoc) return;

      if (settings.activeVehicleId === vehicle.id) {
        const replacement = nonArchivedVehicles.find((v) => v.id !== vehicle.id);
        if (!replacement) {
          alert(t('vehicles.cannotArchiveLast'));
          return;
        }

        const settingsDoc = await db.settings.findOne(settings.id).exec();
        if (settingsDoc) {
          await settingsDoc.update({
            $set: {
              activeVehicleId: replacement.id
            }
          });
        }
      }

      await vehicleDoc.update({
        $set: {
          is_archived: true
        }
      });
    } catch (error) {
      console.error('Error archiving vehicle:', error);
      alert(t('vehicles.archiveFailed'));
    }
  };

  const handleUnarchiveVehicle = async (vehicle: Vehicle) => {
    try {
      const db = await getDatabase();
      const vehicleDoc = await db.vehicles.findOne(vehicle.id).exec();
      if (!vehicleDoc) return;

      await vehicleDoc.update({
        $set: {
          is_archived: false
        }
      });
    } catch (error) {
      console.error('Error unarchiving vehicle:', error);
      alert(t('vehicles.unarchiveFailed'));
    }
  };

  const handleSignOut = async () => {
    if (confirm(t('settings.confirmSignOut'))) {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  const activeVehicles = vehicles.filter((vehicle) => !vehicle.is_archived);
  const archivedVehicles = vehicles.filter((vehicle) => vehicle.is_archived);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center pt-6 mb-6">
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
          >
            ← {t('nav.back')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('settings.title')}
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('settings.appearance')}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.theme')}
              </label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: e.target.value as 'light' | 'dark' | 'system'
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">{t('settings.themeLight')}</option>
                <option value="dark">{t('settings.themeDark')}</option>
                <option value="system">{t('settings.themeSystem')}</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('settings.themeDescription')}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('settings.unitsDisplay')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.distanceUnit')}
                </label>
                <select
                  value={settings.distanceUnit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      distanceUnit: e.target.value as DistanceUnit
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="km">{t('units.km')}</option>
                  <option value="mi">{t('units.mi')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.volumeUnit')}
                </label>
                <select
                  value={settings.volumeUnit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      volumeUnit: e.target.value as VolumeUnit
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="L">{t('units.liters')}</option>
                  <option value="gal_us">{t('units.galUS')}</option>
                  <option value="gal_uk">{t('units.galUK')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.consumptionFormat')}
                </label>
                <select
                  value={settings.consumptionFormat}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      consumptionFormat: e.target.value as ConsumptionFormat
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="km_per_L">{t('units.kmPerL')}</option>
                  <option value="L_per_100km">{t('units.lPer100km')}</option>
                  <option value="mpg_us">{t('units.mpgUS')}</option>
                  <option value="mpg_uk">{t('units.mpgUK')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.language')}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('vehicles.title')}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vehicles.name')}
                </label>
                <input
                  value={newVehicleName}
                  onChange={(e) => setNewVehicleName(e.target.value)}
                  placeholder={t('vehicles.namePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('vehicles.notes')}
                </label>
                <input
                  value={newVehicleNotes}
                  onChange={(e) => setNewVehicleNotes(e.target.value)}
                  placeholder={t('vehicles.notesPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCreateVehicle}
                className="bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
              >
                {t('vehicles.create')}
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('vehicles.activeList')}
              </h3>
              {activeVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {vehicle.name}
                      </p>
                      {vehicle.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {vehicle.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {settings.activeVehicleId === vehicle.id ? (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                          {t('vehicles.active')}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActiveVehicle(vehicle.id)}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                        >
                          {t('vehicles.setActive')}
                        </button>
                      )}
                      <button
                        onClick={() => handleArchiveVehicle(vehicle)}
                        className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
                      >
                        {t('vehicles.archive')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {archivedVehicles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('vehicles.archivedList')}
                </h3>
                {archivedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.name}
                        </p>
                        {vehicle.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {vehicle.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnarchiveVehicle(vehicle)}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                      >
                        {t('vehicles.unarchive')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? t('entry.saving') : t('settings.saveSettings')}
          </button>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('settings.account')}
            </h2>

            {!isLoggedIn ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {t('settings.localOnlyMode')}
                      </h3>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                        {t('settings.localOnlyDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                {!showAccountBenefits ? (
                  <button
                    onClick={() => setShowAccountBenefits(true)}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                  >
                    {t('settings.createAccountBtn')}
                  </button>
                ) : (
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t('settings.accountBenefits')}
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✓
                        </span>
                        <span>{t('settings.benefit1')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✓
                        </span>
                        <span>{t('settings.benefit2')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✓
                        </span>
                        <span>{t('settings.benefit3')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✓
                        </span>
                        <span>{t('settings.benefit4')}</span>
                      </li>
                    </ul>
                    <div className="pt-2 space-y-2">
                      <Link
                        to="/login"
                        className="block w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-center font-medium"
                      >
                        {t('settings.signUpNow')}
                      </Link>
                      <button
                        onClick={() => setShowAccountBenefits(false)}
                        className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                      >
                        {t('settings.maybeLater')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                        {t('settings.cloudSyncEnabled')}
                      </h3>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-200">
                        {t('settings.signedInAs')} {authState.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 dark:bg-red-700 text-white py-2 px-4 rounded-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
                >
                  {t('auth.signOut')}
                </button>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('settings.dataPrivacy')}
            </h2>
            <Link
              to="/delete-account"
              className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-center font-medium border border-gray-300 dark:border-gray-600"
            >
              {t('settings.deleteAccountBtn')}
            </Link>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('settings.deleteAccountDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
