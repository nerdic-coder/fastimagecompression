#!/usr/bin/env node
/**
 * Generate sitemap.xml for the static fastimagecompression.com site.
 *
 * - Includes the homepage and all *.html files in the repo root.
 * - Uses each file's mtime as <lastmod>.
 * - Skips common non-content pages as needed.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_ORIGIN = 'https://fastimagecompression.com';
const ROOT_DIR = path.resolve(process.cwd());

const SKIP_FILES = new Set([
  // Utility/system pages (none currently)
]);

function toIsoDate(date) {
  // date-only format is valid for <lastmod>
  return date.toISOString().slice(0, 10);
}

function escapeXml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function urlForFile(filename) {
  if (filename === 'index.html') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${filename}`;
}

function changefreqFor(filename) {
  if (filename === 'index.html') return 'weekly';
  if (filename === 'guides.html') return 'weekly';
  if (filename.startsWith('guide-')) return 'monthly';
  if (filename.startsWith('compress-')) return 'monthly';
  if (filename === 'about.html' || filename === 'contact.html') return 'yearly';
  if (filename.includes('privacy') || filename.includes('terms')) return 'yearly';
  return 'monthly';
}

function priorityFor(filename) {
  if (filename === 'index.html') return '1.0';
  if (filename === 'guides.html') return '0.8';
  if (filename.startsWith('guide-')) return '0.7';
  if (filename.startsWith('compress-')) return '0.7';
  if (filename === 'about.html' || filename === 'contact.html') return '0.4';
  if (filename.includes('privacy') || filename.includes('terms')) return '0.3';
  return '0.5';
}

async function main() {
  const dirEntries = await fs.readdir(ROOT_DIR, { withFileTypes: true });

  const htmlFiles = dirEntries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => name.endsWith('.html'))
    .filter((name) => !SKIP_FILES.has(name))
    .sort((a, b) => a.localeCompare(b));

  // Ensure homepage is included even if index.html isn't in the list for some reason.
  if (!htmlFiles.includes('index.html')) htmlFiles.unshift('index.html');

  const urls = [];

  for (const filename of htmlFiles) {
    const fullPath = path.join(ROOT_DIR, filename);
    const stat = await fs.stat(fullPath);

    urls.push({
      loc: urlForFile(filename),
      lastmod: toIsoDate(stat.mtime),
      changefreq: changefreqFor(filename),
      priority: priorityFor(filename),
    });
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n` +
          `    <loc>${escapeXml(u.loc)}</loc>\n` +
          `    <lastmod>${u.lastmod}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n` +
          `  </url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  const outPath = path.join(ROOT_DIR, 'sitemap.xml');
  await fs.writeFile(outPath, xml, 'utf8');

  process.stdout.write(`Generated ${outPath} with ${urls.length} URLs\n`);
}

await main();
