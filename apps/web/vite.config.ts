import process from 'node:process'

import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { livestoreDevtoolsPlugin } from '@livestore/devtools-vite'

import path from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 60_001,
    fs: { strict: false },
  },
  worker: { format: 'es' },
  plugins: [cloudflare(), react(), tailwindcss(), livestoreDevtoolsPlugin({ schemaPath: './src/livestore/schema.ts' })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

