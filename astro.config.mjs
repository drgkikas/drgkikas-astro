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
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react(), sitemap()]
});
// update for github desktop