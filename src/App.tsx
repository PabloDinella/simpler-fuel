import { useEffect, useState } from "react";
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routes/routeTree';
import { initAuth, subscribeToAuth, AuthState } from './lib/auth';
import { initDatabase, getDatabase, Settings } from './db';
import { setupReplication, stopReplication } from './db/replication';
import { migrateLocalDataToCloud, hasLocalEntries } from './lib/migration';
import { bootstrapVehicleData } from './lib/vehicles';
import i18n from './i18n/config';

// Create router instance
const router = createRouter({ routeTree });

// Register router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [replicationActive, setReplicationActive] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await initDatabase();
        await bootstrapVehicleData();
        if (!isMounted) return;
        setDbReady(true);
        setDbError(null);
        console.log('[App] Local database and vehicles ready');
      } catch (error: any) {
        console.error('[App] Database init error:', error);
        if (!isMounted) return;
        setDbError(error.message || 'Failed to initialize database');
        setDbReady(false);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initialize();
    initAuth();

    const unsubscribe = subscribeToAuth((state) => {
      setAuthState(state);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    if (authState.user && !replicationActive) {
      setSyncError(null);
      initDatabase()
        .then(async (db) => {
          const needsMigration = await hasLocalEntries();

          if (needsMigration) {
            console.log('[App] Migrating local data to cloud...');
            await migrateLocalDataToCloud(authState.user!.id);
          } else {
            await setupReplication(db, authState.user!.id);
          }

          setReplicationActive(true);
          console.log('[App] Cloud sync enabled');
        })
        .catch((error: any) => {
          console.error('[App] Replication setup error:', error);
          setReplicationActive(false);
          setSyncError(error?.message || 'Cloud sync could not be started');
        });
    }

    if (!authState.user) {
      setSyncError(null);
      if (!replicationActive) return;

      stopReplication()
        .then(() => {
          setReplicationActive(false);
          console.log('[App] Cloud sync disabled');
        })
        .catch((error) => {
          console.error('[App] Stop replication error:', error);
        });
    }
  }, [authState.user, dbReady, replicationActive]);

  // Apply theme based on settings - only after database is ready
  useEffect(() => {
    if (!dbReady) return;

    let subscription: any;

    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    };

    getDatabase().then(async (db) => {
      // Subscribe to theme changes
      subscription = db.settings
        .findOne()
        .$
        .subscribe((doc: any) => {
          if (doc) {
            const settings = doc.toJSON() as Settings;
            applyTheme(settings.theme);
          }
        });
    }).catch(error => {
      console.error('[App] Theme subscription error:', error);
    });

    // Listen for system theme changes when using system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      getDatabase().then(async (db) => {
        const settings = await db.settings.findOne().exec();
        if (settings) {
          const settingsData = settings.toJSON() as Settings;
          if (settingsData.theme === 'system') {
            document.documentElement.classList.toggle('dark', mediaQuery.matches);
          }
        }
      }).catch(error => {
        console.error('[App] Theme change error:', error);
      });
    };
    
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      if (subscription) subscription.unsubscribe();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dbReady]);

  // Apply language based on settings - only after database is ready
  useEffect(() => {
    if (!dbReady) return;

    let subscription: any;

    getDatabase().then(async (db) => {
      // Subscribe to language changes
      subscription = db.settings
        .findOne()
        .$
        .subscribe((doc: any) => {
          if (doc) {
            const settings = doc.toJSON() as Settings;
            i18n.changeLanguage(settings.language);
          }
        });
    }).catch(error => {
      console.error('[App] Language subscription error:', error);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [dbReady]);

  if (authState.loading || !dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center">
          {dbError ? (
            <>
              <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">Database Error</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">{dbError}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Retry
              </button>
            </>
          ) : (
            <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {syncError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-100 border-b border-amber-300 px-4 py-2 text-amber-900 text-sm">
          {syncError}
        </div>
      )}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
