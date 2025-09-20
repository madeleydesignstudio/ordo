/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />

declare global {
  interface Window {
    __BUILD_TIMESTAMP__: number;
  }
}

// Service Worker types
interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
  skipWaiting(): void;
  clients: Clients;
  registration: ServiceWorkerRegistration;
}

// Background sync types
interface SyncEvent extends Event {
  tag: string;
  waitUntil(promise: Promise<any>): void;
}

interface ServiceWorkerGlobalScopeEventMap {
  sync: SyncEvent;
}
