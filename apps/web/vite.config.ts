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
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm,data}"],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          // PGLite assets - cache first for offline functionality
          {
            urlPattern: /\.(?:wasm|data)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "pglite-assets",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Version checking - allow offline fallback
          {
            urlPattern: /\/version\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "version-cache",
              networkTimeoutSeconds: 2,
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 5, // Cache for 5 minutes to reduce network dependency
              },
            },
          },
          // App shell - cache first for true offline support
          {
            urlPattern: /^https?:\/\/[^\/]+\/?$/,
            handler: "CacheFirst",
            options: {
              cacheName: "app-shell",
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          // Static assets - cache first
          {
            urlPattern:
              /^https?:\/\/[^\/]+\/.*\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
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
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
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
