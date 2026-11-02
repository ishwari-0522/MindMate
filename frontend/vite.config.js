import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the browser talks to Vite, which forwards /api to the Express backend.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
