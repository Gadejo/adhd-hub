import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [tailwind()],
  output: 'hybrid',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false
  }),
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      global: 'globalThis'
    },
    resolve: {
      alias: {
        crypto: 'crypto-browserify'
      }
    },
    ssr: {
      external: ['bcryptjs']
    }
  }
});