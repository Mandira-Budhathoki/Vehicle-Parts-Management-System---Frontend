import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const ignoreImports = () => ({
  name: 'ignore-imports',
  resolveId(source: string) {
    if (['canvg', 'html2canvas', 'dompurify'].includes(source)) {
      return '\0virtual:ignored-import';
    }
    return null;
  },
  load(id: string) {
    if (id === '\0virtual:ignored-import') {
      return 'export default {};';
    }
    return null;
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ignoreImports()
  ],
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

