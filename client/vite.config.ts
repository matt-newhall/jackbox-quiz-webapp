import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    allowedHosts: ['jackbox-quiz-app.up.railway.app']
  }
})
