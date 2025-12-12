import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // Falls back to empty string to prevent runtime crashes if env var is not set on Vercel yet
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});