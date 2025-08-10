// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    tanstackStart({
      target: "vercel",
      customViteReactPlugin: true,
      // Ensure proper SSR handling
      ssr: {
        external: ["react", "react-dom"],
      },
      // Add experimental features for Vercel deployment
      experimental: {
        enableOptimizations: true,
      },
    }),
    viteReact(),
    tsConfigPaths(),
    tailwindcss(),
  ],
  // Ensure proper build output
  build: {
    target: "esnext",
    minify: "esbuild",
  },
});
