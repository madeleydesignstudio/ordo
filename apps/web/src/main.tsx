import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TodoApp } from './components/TodoApp';
import { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { PGliteProvider } from '@electric-sql/pglite-react';
import { todoService } from './lib/todoService';
import { useEffect, useState } from 'react';
import type { PGliteWithLive } from '@electric-sql/pglite/live';
import './styles/app.css';

// Build timestamp for version tracking
declare const __BUILD_TIMESTAMP__: number;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const DATABASE_NAME = 'idb://ordo-db';

function App() {
  const [db, setDb] = useState<PGliteWithLive | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineFirstLaunch, setIsOfflineFirstLaunch] = useState(false);

  // Online/offline detection
  useEffect(() => {
    const currentlyOnline = navigator.onLine;
    setIsOnline(currentlyOnline);

    // Detect if this is an offline-first launch
    if (!currentlyOnline) {
      setIsOfflineFirstLaunch(true);
      console.log('🚫 OFFLINE-FIRST LAUNCH: App starting without internet connection');
      console.log('✅ This is exactly what offline-first means - the app works!');
    } else {
      console.log('🌐 Online launch detected');
    }

    const handleOnline = () => {
      setIsOnline(true);
      if (isOfflineFirstLaunch) {
        console.log('🌐 Internet connection restored after offline-first launch');
        setTimeout(() => setIsOfflineFirstLaunch(false), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Going offline - app continues to work normally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineFirstLaunch]);

  // Database initialization
  useEffect(() => {
    const initializeDatabase = async (): Promise<void> => {
      try {
        console.log('🔄 Initializing PGLite database...');

        const database = await PGlite.create({
          dataDir: DATABASE_NAME,
          extensions: { live },
        });

        console.log('✅ PGLite database created successfully');
        setDb(database);
        todoService.setDatabase(database);
        await todoService.initialize();
        console.log('✅ Todo service initialized');

        // Clear any previous errors
        setDbError(null);

        // Mark app as loaded
        document.body.classList.add('loaded');
      } catch (error) {
        console.error('❌ Failed to initialize PGLite:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        setDbError(errorMessage);

        // Don't prevent the app from loading - show error state instead
        console.log('⚠️ App will continue without database functionality');
        document.body.classList.add('loaded');
      }
    };

    // Add a small delay to ensure the app doesn't block on database initialization
    const timeoutId = setTimeout(initializeDatabase, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // PWA registration
  useEffect(() => {
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('./sw.js');
          console.log('✅ Service Worker registered:', registration.scope);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New version available');
                }
              });
            }
          });
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      });
    }

    // Store build timestamp for version tracking
    const buildTimestamp = __BUILD_TIMESTAMP__.toString();
    const storedTimestamp = localStorage.getItem('app_version');
    if (!storedTimestamp) {
      localStorage.setItem('app_version', buildTimestamp);
      console.log('📦 Stored build timestamp for offline operation');
    }
  }, []);

  if (dbError && !db) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <OfflineBanner isOnline={isOnline} />
        <OfflineFirstBanner isOfflineFirstLaunch={isOfflineFirstLaunch} isOnline={isOnline} />
        <DatabaseErrorBanner error={dbError} />

        <div style={{ marginTop: isOfflineFirstLaunch ? '120px' : '80px' }}>
          <h2>⚠️ Database Unavailable</h2>
          <p>The app is running but database features are disabled.</p>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
            Error: {dbError}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!db) {
    // Loading screen is handled by CSS and index.html
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PGliteProvider db={db}>
        <OfflineBanner isOnline={isOnline} />
        <OfflineFirstBanner isOfflineFirstLaunch={isOfflineFirstLaunch} isOnline={isOnline} />

        <main style={{
          paddingTop: (!isOnline ? 40 : 0) + (isOfflineFirstLaunch ? 40 : 0) + 'px'
        }}>
          <TodoApp />
        </main>
      </PGliteProvider>
    </QueryClientProvider>
  );
}

interface OfflineBannerProps {
  isOnline: boolean;
}

function OfflineBanner({ isOnline }: OfflineBannerProps) {
  if (isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#4caf50',
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        zIndex: 1000,
      }}
    >
      📱 Offline Mode - App fully functional!
    </div>
  );
}

interface OfflineFirstBannerProps {
  isOfflineFirstLaunch: boolean;
  isOnline: boolean;
}

function OfflineFirstBanner({ isOfflineFirstLaunch, isOnline }: OfflineFirstBannerProps) {
  if (!isOfflineFirstLaunch) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: isOnline ? '0' : '40px',
        left: 0,
        right: 0,
        background: '#4F46E5',
        color: 'white',
        padding: '8px 12px',
        textAlign: 'center',
        zIndex: 999,
        fontSize: '14px',
        fontWeight: 'bold',
      }}
    >
      🎉 OFFLINE-FIRST SUCCESS! App launched without internet & works perfectly!
      {isOnline && ' 🌐 Now online - sync available'}
    </div>
  );
}

interface DatabaseErrorBannerProps {
  error: string;
}

function DatabaseErrorBanner({ error }: DatabaseErrorBannerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#ff9800',
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        zIndex: 1001,
        fontSize: '14px',
      }}
    >
      ⚠️ Database Error: App running in limited mode
    </div>
  );
}

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

// Log successful app load
console.log('🚀 Ordo Todo App loaded successfully!');
console.log('💡 This app works completely offline - no internet required!');
