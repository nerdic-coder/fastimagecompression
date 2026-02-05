#!/usr/bin/env node
/**
 * Adds a "Related guides" internal links section to guide pages that don't have one.
 *
 * Inserts before the closing </div></div></main> wrapper so it appears above the footer.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());

const relatedByFile = {
  'guide-batch-compress-workflow.html': [
    ['guide-image-optimization-checklist.html', 'Website image optimization checklist'],
    ['guide-resize-before-compress.html', 'Resize before you compress'],
    ['guide-compress-images-for-wordpress.html', 'Compress images for WordPress'],
  ],
  'guide-compress-images-for-wordpress.html': [
    ['guide-core-web-vitals-images.html', 'Image optimization for Core Web Vitals'],
    ['guide-choose-image-quality.html', 'How to choose image quality'],
    ['guide-resize-before-compress.html', 'Resize before you compress'],
  ],
  'guide-core-web-vitals-images.html': [
    ['guide-image-optimization-checklist.html', 'Website image optimization checklist'],
    ['guide-resize-before-compress.html', 'Resize before you compress'],
    ['guide-webp-vs-avif.html', 'WebP vs AVIF'],
  ],
  'guide-image-formats-for-social-media.html': [
    ['guide-jpeg-vs-png-webp.html', 'JPEG vs PNG vs WebP'],
    ['guide-choose-image-quality.html', 'How to choose image quality'],
    ['guide-lossy-vs-lossless.html', 'Lossy vs lossless compression'],
  ],
  'guide-resize-before-compress.html': [
    ['guide-image-optimization-checklist.html', 'Website image optimization checklist'],
    ['guide-core-web-vitals-images.html', 'Image optimization for Core Web Vitals'],
    ['guide-batch-compress-workflow.html', 'Batch compress workflow'],
  ],
  'guide-webp-vs-avif.html': [
    ['guide-jpeg-vs-png-webp.html', 'JPEG vs PNG vs WebP'],
    ['guide-lossy-vs-lossless.html', 'Lossy vs lossless compression'],
    ['guide-core-web-vitals-images.html', 'Image optimization for Core Web Vitals'],
  ],
};

function buildSection(items) {
  const lis = items
    .map(([href, label]) => `                        <li><a href="${href}">${label}</a></li>`)
    .join('\n');

  return (
    `\n\n                <section class="policy-section">\n` +
    `                    <h2>Related guides</h2>\n` +
    `                    <ul>\n` +
    `${lis}\n` +
    `                    </ul>\n` +
    `                </section>\n`
  );
}

async function main() {
  let changed = 0;
  let skipped = 0;

  for (const [filename, items] of Object.entries(relatedByFile)) {
    const fullPath = path.join(ROOT, filename);
    let html;
    try {
      html = await fs.readFile(fullPath, 'utf8');
    } catch {
      skipped++;
      continue;
    }

    if (html.includes('<h2>Related guides</h2>')) {
      skipped++;
      continue;
    }

    const needle = '\n            </div>\n        </div>\n    </main>';
    const idx = html.indexOf(needle);
    if (idx === -1) {
      throw new Error(`Could not find insertion point in ${filename}`);
    }

    const insert = buildSection(items);
    html = html.slice(0, idx) + insert + html.slice(idx);
    await fs.writeFile(fullPath, html, 'utf8');
    changed++;
  }

  process.stdout.write(`Related guides: updated ${changed}, skipped ${skipped}\n`);
}

await main();
