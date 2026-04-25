import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/meal-planner/',
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['@react-pdf/renderer', 'html2canvas'],
          icons: ['lucide-react'],
        }
      }
    }
  }
})
