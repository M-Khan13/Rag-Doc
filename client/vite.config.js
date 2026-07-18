import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The client calls "/api/..." and "/health". In dev, Vite proxies both to the
// Express backend on 5002. This means the frontend code never hardcodes
// localhost:5002 — it just talks to its own origin, and the proxy forwards.
// (Your backend already has cors() enabled, so direct calls would also work,
// but the proxy keeps the client code origin-agnostic and avoids CORS edge cases.)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5002',
      '/health': 'http://localhost:5002',
    },
  },
})
