import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@reown/appkit',
      '@reown/appkit-adapter-wagmi',
      'wagmi',
      'viem',
    ],
    exclude: [
      '@hashgraph/sdk',
      '@hashgraph/proto',
      '@reown/walletkit',
      // '@hashgraph/hedera-wallet-connect',
      '@walletconnect/modal',
    ],
    esbuildOptions: {
      target: 'esnext',
      // Mark problematic packages as external during optimization
      // external: ['@hashgraph/proto'],
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    port: 8080,
    host: true,
  },
});