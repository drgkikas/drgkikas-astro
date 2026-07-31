// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import fs from 'fs';
import path from 'path';

// Helper to dynamically find all rTMS URLs from markdown content files at build time
function getRtmsUrls() {
  const urls = [];
  const baseDir = './src/content/rtms';
  
  if (!fs.existsSync(baseDir)) return urls;
  
  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith('.md')) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const slug = relPath.slice(0, -3); // Remove .md extension
        
        if (slug.startsWith('en/')) {
          urls.push(`https://drgkikas.com/en/rtms/${slug.slice(3)}`);
        } else if (slug.startsWith('it/')) {
          urls.push(`https://drgkikas.com/it/rtms/${slug.slice(3)}`);
        } else {
          urls.push(`https://drgkikas.com/rtms/${slug}`);
        }
      }
    }
  }
  
  walk(baseDir);
  return urls;
}

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
    customPages: getRtmsUrls(),
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