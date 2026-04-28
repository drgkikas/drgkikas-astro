// post-build-worker.mjs
// Bundles the Astro SSR server entry into dist/client/_worker.js
// so Cloudflare Pages can detect and deploy it as a Worker

import { build } from 'esbuild';
import { rmSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { resolve } from 'path';

// 1. Remove .wrangler/ to prevent redirect issues
if (existsSync('.wrangler')) {
  rmSync('.wrangler', { recursive: true, force: true });
  console.log('✓ Removed .wrangler/ redirect config');
}

// 2. Ensure dist/client exists
if (!existsSync('dist/client')) {
  mkdirSync('dist/client', { recursive: true });
}

// 3. Bundle dist/server/entry.mjs into dist/client/_worker.js
// This matches the user's stable production routing
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
