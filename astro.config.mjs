// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://drgkikas.com',
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: { enabled: false }
  }),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react(), sitemap()],
  i18n: {
    defaultLocale: 'el',
    locales: ['el', 'en', 'it'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
// update for github desktop