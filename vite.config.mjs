import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@core': path.resolve(__dirname, './core'),
      '@rendering': path.resolve(__dirname, './rendering'),
      '@ui': path.resolve(__dirname, './ui'),
      '@workers': path.resolve(__dirname, './workers'),
    },
  },
  optimizeDeps: {
    include: ['three'],
  },
  build: {
    sourcemap: true,
  },
})