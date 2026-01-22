import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { getDatabase, Settings } from '../db';
import { signOut, getAuthState } from '../lib/auth';
import type { DistanceUnit, VolumeUnit, ConsumptionFormat } from '../lib/units';

export default function SettingsPage() {
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
            language: settings.language
          }
        });
      }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Units & Display</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance Unit
                </label>
                <select
                  value={settings.distanceUnit}
                  onChange={(e) => setSettings({ ...settings, distanceUnit: e.target.value as DistanceUnit })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Unit
                </label>
                <select
                  value={settings.volumeUnit}
                  onChange={(e) => setSettings({ ...settings, volumeUnit: e.target.value as VolumeUnit })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="L">Liters (L)</option>
                  <option value="gal_us">Gallons US (gal)</option>
                  <option value="gal_uk">Gallons UK (gal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumption Display Format
                </label>
                <select
                  value={settings.consumptionFormat}
                  onChange={(e) => setSettings({ ...settings, consumptionFormat: e.target.value as ConsumptionFormat })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="km_per_L">Kilometers per Liter (km/L)</option>
                  <option value="L_per_100km">Liters per 100km (L/100km)</option>
                  <option value="mpg_us">Miles per Gallon US (mpg)</option>
                  <option value="mpg_uk">Miles per Gallon UK (mpg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            
            {!isLoggedIn ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-blue-900">
                        Currently using Local Only mode
                      </h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Your data is stored on this device only. Create an account to enable cloud sync.
                      </p>
                    </div>
                  </div>
                </div>

                {!showAccountBenefits ? (
                  <button
                    onClick={() => setShowAccountBenefits(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                  >
                    Create Account & Enable Cloud Sync
                  </button>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-900">Benefits of creating an account:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Automatic cloud backup of all your fuel entries</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Sync across multiple devices (phone, tablet, computer)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Real-time updates when you add entries on any device</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Never lose your data, even if you clear browser cache</span>
                      </li>
                    </ul>
                    <div className="pt-2 space-y-2">
                      <Link
                        to="/login"
                        className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center font-medium"
                      >
                        Sign Up Now
                      </Link>
                      <button
                        onClick={() => setShowAccountBenefits(false)}
                        className="w-full text-sm text-gray-600 hover:text-gray-800"
                      >
                        Maybe later
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-900">
                        Cloud sync enabled
                      </h3>
                      <p className="mt-1 text-sm text-green-700">
                        Signed in as {authState.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
