#!/usr/bin/env node
/**
 * Builds fonts using fantasticon and generates the docs HTML page.
 * Uses fantasticon's programmatic API so we can inject icons.json
 * metadata (aliases, colors, groups) into the HTML template context.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateFonts } from 'fantasticon';
import Handlebars from 'handlebars';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const iconsData = JSON.parse(readFileSync(join(ROOT, 'icons.json'), 'utf8'));

// Build codepoints map
const codepoints = {};
for (const [name, meta] of Object.entries(iconsData.icons)) {
  codepoints[name] = parseInt(meta.codepoint, 16);
}

// Generate fonts (without HTML — we'll do that ourselves)
console.log('Generating fonts...');
const result = await generateFonts({
  inputDir: join(ROOT, 'svg'),
  outputDir: join(ROOT, 'font'),
  name: 'openwebicons',
  fontTypes: ['woff2', 'woff', 'ttf', 'eot', 'svg'],
  assetTypes: ['json'],
  fontHeight: 1024,
  normalize: true,
  codepoints,
  pathOptions: {
    json: join(ROOT, 'font', 'openwebicons.json'),
  },
  formatOptions: {
    svg: { fontId: 'openweb_iconsregular' },
  },
});

console.log(`  ${Object.keys(result.codepoints).length} glyphs generated`);

// Build template data
const coloredIcons = Object.entries(iconsData.icons)
  .filter(([, m]) => m.color)
  .map(([name, m]) => ({ name, color: m.color }));

const aliasIcons = Object.entries(iconsData.aliases)
  .map(([name, m]) => ({ name, aliasOf: m.aliasOf }));

const compositionIcons = Object.entries(iconsData.compositions)
  .map(([name, m]) => ({ name, glyphs: m.glyphs.join(' + ') }));

const allGrouped = new Set();
const groupedIcons = Object.entries(iconsData.groups || {}).map(([groupName, members]) => ({
  groupName,
  icons: members.map(m => {
    allGrouped.add(m);
    const meta = iconsData.icons[m];
    return { name: m, codepoint: meta ? meta.codepoint : '?' };
  }),
}));

const ungroupedIcons = Object.entries(iconsData.icons)
  .filter(([name]) => !allGrouped.has(name))
  .map(([name, m]) => ({ name, codepoint: m.codepoint }));

// Render HTML template
const templateSrc = readFileSync(join(ROOT, 'templates', 'html.hbs'), 'utf8');
const template = Handlebars.compile(templateSrc);

const html = template({
  name: 'openwebicons',
  prefix: 'icon',
  tag: 'i',
  assets: result.codepoints,
  coloredIcons,
  aliasIcons,
  compositionIcons,
  groupedIcons,
  ungroupedIcons,
  iconCount: Object.keys(iconsData.icons).length,
  aliasCount: aliasIcons.length,
  compositionCount: compositionIcons.length,
  coloredCount: coloredIcons.length,
});

mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs', 'index.html'), html);
console.log('  docs/index.html generated');
