// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { writeFileSync } from "fs";
import { join } from "path";

// Add build timestamp for cache busting
const buildTimestamp = Date.now();

// Generate version file
const versionData = {
  version: buildTimestamp.toString(),
  timestamp: buildTimestamp,
  updated: new Date().toISOString(),
};

writeFileSync(
  join(process.cwd(), "public", "version.json"),
  JSON.stringify(versionData, null, 2),
);

export default defineConfig({
  define: {
    __BUILD_TIMESTAMP__: buildTimestamp,
  },
  server: {
    port: 3001,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ customViteReactPlugin: true, target: "vercel" }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      workbox: {
        globPatterns: ["**/*.{js,css,wasm,data}"],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        skipWaiting: false,
        clientsClaim: false,
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /\.(?:wasm|data)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "pglite-assets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          // Enhanced caching for mobile with aggressive update checking
          {
            urlPattern: /\/version\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "version-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 0, // Don't cache version.json
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                // Always include timestamp to prevent caching
                const url = new URL(request.url);
                url.searchParams.set("_t", Date.now().toString());
                return url.toString();
              },
            },
          },
          // Cache app shell with network-first for mobile
          {
            urlPattern: /^https?:\/\/[^\/]+\/$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "app-shell",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Ordo Todo App",
        short_name: "Ordo",
        description: "Offline-first todo app with PGlite",
        theme_color: "#4F46E5",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",

        icons: [
          {
            src: "/icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    format: "es",
  },
});
