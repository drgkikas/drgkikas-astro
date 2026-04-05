// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://drgkikas.gr',
  adapter: cloudflare({
    imageService: 'compile',
    sessionKVBindingName: undefined,
  }),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react(), sitemap()]
});