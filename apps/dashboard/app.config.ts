// app.config.ts
import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
  server: {
    preset: 'netlify',
    prerender: {
      routes: ['/'], // Add other routes you want to prerender
      ignore: ['/api/**'], // Ignore API routes
    },
  },
})