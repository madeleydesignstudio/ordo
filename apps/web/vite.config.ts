// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Add build timestamp for cache busting
const buildTimestamp = Date.now();

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
        globPatterns: ["**/*.{js,css,html,wasm,data}"],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 3,
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
