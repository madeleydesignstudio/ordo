// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
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
  base: "/", // Absolute paths for Vercel deployment
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          query: ["@tanstack/react-query"],
          pglite: ["@electric-sql/pglite"],
        },
      },
    },
  },
  plugins: [
    tsConfigPaths(),
    viteReact(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        // CRITICAL: Cache ALL resources for complete offline operation
        globPatterns: [
          "**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2,wasm,data}",
        ],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB for PGLite
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

        // Cache everything immediately on install
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,

        runtimeCaching: [
          // PGLite WASM files - absolutely critical for offline database
          {
            urlPattern: /\.(?:wasm|data)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "pglite-wasm-v1",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year - never expire
              },
            },
          },
          // App shell - serve from cache first always
          {
            urlPattern: /^.*\.(js|css|html)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "app-shell-v1",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Images and icons
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|ico|webp|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-v1",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      includeAssets: ["**/*"],
      manifest: {
        name: "Ordo - Offline Todo App",
        short_name: "Ordo",
        description: "True offline-first todo app that works without internet",
        theme_color: "#4F46E5",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        id: "ordo-offline-todo",
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "Add Todo",
            description: "Quickly add a new todo",
            url: "/?action=add",
            icons: [{ src: "/icon.svg", sizes: "192x192" }],
          },
        ],
        launch_handler: {
          client_mode: "navigate-existing",
        },
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    format: "es",
  },
  server: {
    port: 3001,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
