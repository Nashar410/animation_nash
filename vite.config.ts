import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@core': path.resolve(__dirname, './core'),
      '@rendering': path.resolve(__dirname, './rendering'),
      '@ui': path.resolve(__dirname, './ui'),
      '@workers': path.resolve(__dirname, './workers'),
    },
  },
  worker: {
    format: 'es'
  }
})
