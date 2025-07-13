import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  // server: {
  //   proxy: {
  //     '/verse_api': {
  //       target: 'https://api.esv.org',
  //       rewrite: (path) => path.replace(/^\/verse_api/, ''),
  //       secure: true,
  //       changeOrigin: true,
  //       headers: {
  //         'Access-Control-Allow-Origin': '*',
  //       },
  //     },
  //   },
  //   cors: {
  //     origin: '*',
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //     credentials: true,
  //   },
  // },
});
