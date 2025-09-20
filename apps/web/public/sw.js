const CACHE_NAME = "ordo-pwa-v1";
const STATIC_ASSETS = ["/", "/manifest.webmanifest", "/icon.svg"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching app shell");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Service Worker: Skip waiting");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Cache failed:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("Service Worker: Claiming clients");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://") ||
    event.request.url.includes("_vercel")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log("Service Worker: Serving from cache:", event.request.url);
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses or non-basic responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();
          const url = event.request.url;

          // Cache strategy based on file type
          caches.open(CACHE_NAME).then((cache) => {
            // Cache HTML documents
            if (event.request.headers.get("accept")?.includes("text/html")) {
              console.log("Service Worker: Caching HTML:", url);
              cache.put(event.request, responseToCache.clone());
            }
            // Cache static assets (JS, CSS, WASM, data files)
            else if (
              url.includes("/assets/") ||
              url.endsWith(".js") ||
              url.endsWith(".css") ||
              url.endsWith(".wasm") ||
              url.endsWith(".data") ||
              url.endsWith(".svg") ||
              url.endsWith(".png") ||
              url.endsWith(".ico")
            ) {
              console.log("Service Worker: Caching asset:", url);
              cache.put(event.request, responseToCache.clone());
            }
          });

          return response;
        })
        .catch((error) => {
          console.log("Service Worker: Fetch failed:", error);
          // Network failed, try to serve cached fallback
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/").then((cachedResponse) => {
              return (
                cachedResponse ||
                new Response("App is offline", {
                  status: 503,
                  headers: { "Content-Type": "text/html" },
                })
              );
            });
          }
          throw error;
        });
    }),
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
