// scripts/check-meta-descriptions.mjs
// Post-build diagnostic script to inspect meta descriptions across built HTML files

import fs from 'fs';
import path from 'path';

const distDir = 'dist/client';

if (!fs.existsSync(distDir)) {
  console.log('ℹ dist/client does not exist, skipping meta description check.');
  process.exit(0);
}

function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function decodeHtml(html) {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const htmlFiles = getAllHtmlFiles(distDir);
console.log(`\n🔍 Checking meta descriptions in ${htmlFiles.length} HTML files...`);

let issuesCount = 0;
let over150Count = 0;
let markdownIssues = 0;
let multipleMetaCount = 0;
let missingMetaCount = 0;

for (const file of htmlFiles) {
  const relPath = path.relative(distDir, file).replace(/\\/g, '/');
  // Skip 404 page if desired, or check all
  const content = fs.readFileSync(file, 'utf8');

  // Find all meta description tags
  const matches = [...content.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/gi)];

  if (matches.length === 0) {
    missingMetaCount++;
    console.warn(`⚠️  [Missing] No meta description in: ${relPath}`);
    issuesCount++;
    continue;
  }

  if (matches.length > 1) {
    multipleMetaCount++;
    console.warn(`⚠️  [Multiple] ${matches.length} meta descriptions found in: ${relPath}`);
    issuesCount++;
  }

  const rawDesc = matches[0][1];
  if (!rawDesc || rawDesc.trim().length === 0) {
    console.warn(`⚠️  [Empty] Meta description is empty in: ${relPath}`);
    issuesCount++;
    continue;
  }

  const decoded = decodeHtml(rawDesc).normalize('NFC');
  const codePoints = [...decoded].length;

  const hasMarkdown = /\[.*?\]\(.*?\)/.test(rawDesc);
  if (hasMarkdown) {
    markdownIssues++;
    console.warn(`⚠️  [Markdown link] In ${relPath}: "${rawDesc}"`);
    issuesCount++;
  }

  const hasHtmlTags = /<[^>]+>/.test(rawDesc);
  if (hasHtmlTags) {
    console.warn(`⚠️  [HTML tag] In ${relPath}: "${rawDesc}"`);
    issuesCount++;
  }

  if (codePoints > 150) {
    over150Count++;
  }
}

console.log(`\n📊 Meta Description Summary:`);
console.log(`   - Total HTML files checked: ${htmlFiles.length}`);
console.log(`   - Missing meta descriptions: ${missingMetaCount}`);
console.log(`   - Multiple meta descriptions: ${multipleMetaCount}`);
console.log(`   - Markdown syntax detected: ${markdownIssues}`);
console.log(`   - Length > 150 characters: ${over150Count}`);
console.log(`✓ Check finished (diagnostic only, build continues).\n`);

process.exit(0);
