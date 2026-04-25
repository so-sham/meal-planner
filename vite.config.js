import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/meal-planner/',
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
  },

})
