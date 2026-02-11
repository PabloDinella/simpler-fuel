import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { getAuthState, signOut } from '../lib/auth';
import { getDatabase } from '../db';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const authState = getAuthState();
  const isLoggedIn = !!authState.user;
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete my account') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const db = await getDatabase();
      
      // Delete all fuel entries
      const entries = await db.fuel_entries.find().exec();
      for (const entry of entries) {
        await entry.remove();
      }

      // If logged in, sign out
      if (isLoggedIn) {
        await signOut();
      }

      // Clear local database
      await db.remove();

      alert('Your account and all data have been successfully deleted. You will now be redirected to the login page.');
      navigate({ to: '/login' });
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center pt-6 mb-6">
          <Link
            to="/settings"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
          >
            ← Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Delete Account & Data
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Account Deletion Request - Simpler Fuel
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This page allows you to permanently delete your Simpler Fuel account and all associated data.
              Please read the information below carefully before proceeding.
            </p>
          </div>

          <div className="mb-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Steps to Delete Your Account
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-2">
                <li>Review what data will be deleted (see below)</li>
                <li>If you're logged in, you can delete your account directly using the form below</li>
                <li>If you need assistance, contact us at: <strong>pablo.dinella+simplerfuel@gmail.com</strong></li>
                <li>Type the confirmation phrase and click the "Delete My Account" button</li>
                <li>Your account will be immediately deleted from your device</li>
                <li>Cloud data will be permanently deleted within 30 days</li>
              </ol>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Data That Will Be Deleted
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-2">
                <li><strong>Account Information:</strong> Your email address and authentication credentials</li>
                <li><strong>Fuel Entry Records:</strong> All your fuel consumption entries, including dates, odometer readings, fuel amounts, and notes</li>
                <li><strong>User Preferences:</strong> Your saved settings including language, units, and consumption format preferences</li>
                <li><strong>Local Data:</strong> All data stored on your device</li>
                <li><strong>Cloud Data:</strong> All synchronized data in our cloud database</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Data Retention Period
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Immediate:</strong> Local data on your device is deleted immediately when you confirm deletion.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Cloud Data:</strong> Your cloud-synchronized data will be permanently deleted from our servers within <strong>30 days</strong> of your deletion request.
                This retention period allows us to process the deletion securely and handle any backup cleanup.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Note:</strong> After deletion, your data cannot be recovered. Please export your data before deleting if you want to keep a backup.
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Alternative: Contact Support
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                If you encounter any issues with the deletion process or prefer manual assistance, please contact us at:
              </p>
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="font-semibold text-gray-900 dark:text-white">Email: pablo.dinella+simplerfuel@gmail.com</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Include your account email address in the request
                </p>
              </div>
            </div>
          </div>

          {isLoggedIn ? (
            <div className="border-t border-red-200 dark:border-red-800 pt-6">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                ⚠️ Warning: This Action Cannot Be Undone
              </h3>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <strong>"DELETE MY ACCOUNT"</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isDeleting}
                />
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText.toLowerCase() !== 'delete my account'}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account Permanently'}
              </button>

              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                This will delete all your data immediately from your device and from our servers within 30 days.
              </p>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mb-4">
                <p className="text-blue-700 dark:text-blue-400">
                  You are not currently logged in. To delete your account, please:
                </p>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-2 mb-6">
                <li>
                  <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Log in to your account
                  </Link>
                </li>
                <li>Return to this page to complete the deletion</li>
                <li>Or email us at <strong>pablo.dinella+simplerfuel@gmail.com</strong> with your account email</li>
              </ol>

              <Link
                to="/login"
                className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you're experiencing issues or have questions about data deletion, 
            please contact our support team at <strong>pablo.dinella+simplerfuel@gmail.com</strong>.
            We typically respond within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
