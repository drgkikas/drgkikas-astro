// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://drgkikas.com',
  adapter: cloudflare({
    platform: 'pages',
    imageService: 'passthrough',
    platformProxy: { enabled: false }
  }),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react(), sitemap()]
});
// update for github desktop