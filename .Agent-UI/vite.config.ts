import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4750,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})