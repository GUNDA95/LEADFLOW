import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'lucide-react',
        '@supabase/supabase-js',
        'recharts',
        'clsx',
        'tailwind-merge',
        'date-fns',
        'date-fns/locale'
      ]
    }
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});