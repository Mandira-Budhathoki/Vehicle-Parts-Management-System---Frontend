import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-aria/SSRProvider': path.resolve(__dirname, './src/shims/react-aria-ssr.tsx'),
      'react-aria/private/ssr/SSRProvider': path.resolve(__dirname, './src/shims/react-aria-ssr.tsx'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5114',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

