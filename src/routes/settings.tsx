import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { getDatabase, Settings } from "../db";
import { signOut, getAuthState } from "../lib/auth";
import type { DistanceUnit, VolumeUnit, ConsumptionFormat } from "../lib/units";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { addRxPlugin } from "rxdb";
addRxPlugin(RxDBUpdatePlugin);

export default function SettingsPage() {
  const { t } = useTranslation();
  const authState = getAuthState();
  const isLoggedIn = !!authState.user;
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAccountBenefits, setShowAccountBenefits] = useState(false);

  useEffect(() => {
    getDatabase().then(async (db) => {
      const userSettings = await db.settings.findOne().exec();
      if (userSettings) {
        setSettings(userSettings.toJSON() as Settings);
      }
      setLoading(false);
    });
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
            theme: settings.theme,
          },
        });
      }
      alert(t('settings.saveSettings') + ' ' + t('common.success').toLowerCase() + '!');
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm(t('settings.confirmSignOut'))) {
      try {
        await signOut();
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">{t('common.loading')}</div>
      </div>
    );
  }

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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.theme')}
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      theme: e.target.value as "light" | "dark" | "system",
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
                      distanceUnit: e.target.value as DistanceUnit,
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
                      volumeUnit: e.target.value as VolumeUnit,
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
                      consumptionFormat: e.target.value as ConsumptionFormat,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="km_per_L">{t('units.kmPerL')}</option>
                  <option value="L_per_100km">
                    {t('units.lPer100km')}
                  </option>
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
                        <span>
                          {t('settings.benefit1')}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✓
                        </span>
                        <span>
                          {t('settings.benefit2')}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✓
                        </span>
                        <span>
                          {t('settings.benefit3')}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 dark:text-green-400 mr-2">
                          ✓
                        </span>
                        <span>
                          {t('settings.benefit4')}
                        </span>
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
