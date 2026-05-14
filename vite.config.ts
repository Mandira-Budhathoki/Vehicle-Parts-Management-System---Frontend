import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5114',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      'react-aria/SSRProvider': '/src/shims/react-aria-ssr.tsx',
      'react-aria/private/ssr/SSRProvider': '/src/shims/react-aria-ssr.tsx',
    },
  },
})

