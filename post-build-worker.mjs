// post-build-worker.mjs
// Bundles the Astro SSR server entry into dist/client/_worker.js
// so Cloudflare Pages can detect and deploy it as a Worker

import { build } from 'esbuild';
import { rmSync, existsSync } from 'fs';
import { resolve } from 'path';

// 1. Remove .wrangler/ to prevent redirect to problematic dist/server/wrangler.json
if (existsSync('.wrangler')) {
  rmSync('.wrangler', { recursive: true, force: true });
  console.log('✓ Removed .wrangler/ redirect config');
}

// 2. Bundle dist/server/entry.mjs into dist/client/_worker.js (single bundled file)
await build({
  entryPoints: ['dist/server/entry.mjs'],
  bundle: true,
  outfile: 'dist/client/_worker.js',
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  external: [
    'cloudflare:*',
    'node:*',
    '__STATIC_CONTENT_MANIFEST',
  ],
  minify: false,
  logLevel: 'info',
});

console.log('✓ Bundled Worker → dist/client/_worker.js');
