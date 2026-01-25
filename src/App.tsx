import { useEffect, useState } from "react";
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routes/routeTree';
import { initAuth, subscribeToAuth, AuthState } from './lib/auth';
import { initDatabase, getDatabase, Settings } from './db';
import { setupReplication, stopReplication } from './db/replication';
import { migrateLocalDataToCloud, hasLocalEntries } from './lib/migration';

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

  useEffect(() => {
    // Initialize database immediately (no auth required)
    initDatabase().then(() => {
      setDbReady(true);
      setDbError(null);
      console.log('[App] Local database ready');
    }).catch(error => {
      console.error('[App] Database init error:', error);
      setDbError(error.message || 'Failed to initialize database');
      setDbReady(false);
      // Still mark auth as ready so user can see the error
      setAuthState(prev => ({ ...prev, loading: false }));
    });

    // Initialize auth system
    initAuth();
    
    // Subscribe to auth changes
    const unsubscribe = subscribeToAuth((state) => {
      setAuthState(state);
      
      // Setup replication when user logs in
      if (state.user && dbReady && !replicationActive) {
        initDatabase().then(async (db) => {
          // Check if there's local data to migrate
          const needsMigration = await hasLocalEntries();
          
          if (needsMigration) {
            console.log('[App] Migrating local data to cloud...');
            await migrateLocalDataToCloud(state.user!.id);
          } else {
            // Just setup replication
            await setupReplication(db, state.user!.id);
          }
          
          setReplicationActive(true);
          console.log('[App] Cloud sync enabled');
        }).catch(error => {
          console.error('[App] Replication setup error:', error);
        });
      }
      
      // Stop replication when user logs out
      if (!state.user && replicationActive) {
        stopReplication().then(() => {
          setReplicationActive(false);
          console.log('[App] Cloud sync disabled');
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dbReady, replicationActive]);

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

  return <RouterProvider router={router} />;
}

export default App;
