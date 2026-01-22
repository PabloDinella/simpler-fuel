import { useEffect, useState } from "react";
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routes/routeTree';
import { initAuth, subscribeToAuth, AuthState } from './lib/auth';
import { initDatabase } from './db';
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
  const [replicationActive, setReplicationActive] = useState(false);

  useEffect(() => {
    // Initialize database immediately (no auth required)
    initDatabase().then(() => {
      setDbReady(true);
      console.log('[App] Local database ready');
    }).catch(error => {
      console.error('[App] Database init error:', error);
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

  if (authState.loading || !dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
