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
  integrations: [react(), sitemap({
    filter: (page) => !page.includes('/pgx/') || page.includes('/ypiresies/pgx'),
    serialize(item) {
      // Strip trailing slash so sitemap URLs match canonical link tags
      if (item.url.endsWith('/') && item.url !== 'https://drgkikas.com/') {
        item.url = item.url.slice(0, -1);
      }
      return item;
    }
  })],
  i18n: {
    defaultLocale: 'el',
    locales: ['el', 'en', 'it'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
// update for github desktop