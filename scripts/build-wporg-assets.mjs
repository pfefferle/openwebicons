#!/usr/bin/env node
/**
 * Renders the wordpress.org banner and icon from the plugin's own glyphs.
 *
 * Writes the SVG sources and the PNG sizes the plugin directory expects into
 * .wordpress-org/. Needs rsvg-convert (librsvg) on the PATH for the PNGs.
 *
 * Usage: node scripts/build-wporg-assets.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, '.wordpress-org');
const icons = JSON.parse(readFileSync(join(ROOT, 'icons.json'), 'utf8'));

const BG = '#ffffff';
const FG = '#1a1a1a';
const MUTED = '#666666';
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

/**
 * Returns a nested <svg> that draws one glyph in a square of `size` at (x, y).
 * Compositions live in composed/ with a wider viewBox; everything else is
 * one of the 1034x1024 files in svg/.
 */
function glyph(name, x, y, size, color) {
  const file = icons.compositions[name]
    ? join(ROOT, 'composed', `${name}.svg`)
    : join(ROOT, 'svg', `${name}.svg`);
  const source = readFileSync(file, 'utf8');
  const viewBox = source.match(/viewBox="([^"]+)"/)[1];
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  const paths = [...source.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1]);
  // Fit the glyph into the square: wide compositions scale down by width.
  const scale = size / Math.max(vw, vh);
  const width = vw * scale, height = vh * scale;
  const dx = (size - width) / 2, dy = (size - height) / 2;
  return `<svg x="${x + dx}" y="${y + dy}" width="${width}" height="${height}" viewBox="${viewBox}">`
    + paths.map(d => `<path fill="${color}" d="${d}"/>`).join('')
    + '</svg>';
}

const color = name => icons.icons[name]?.color || FG;

// --- Banner -----------------------------------------------------------------

// A field of icons on the right, the colored ones in their brand color.
const FIELD = [
  'html5', 'feed', 'cc', 'mastodon', 'activitypub',
  'indieweb', 'fediverse', 'microformats', 'pixelfed', 'peertube',
  'lemmy', 'opml', 'webmention', 'wordpress', 'opensearch',
];

function banner(w, h) {
  const s = w / 1544;
  const cols = 5, rows = 3;
  const size = 96 * s, gap = 44 * s;
  const gridW = cols * size + (cols - 1) * gap;
  const gridH = rows * size + (rows - 1) * gap;
  const gx = w - gridW - 88 * s;
  const gy = (h - gridH) / 2;

  const field = FIELD.map((name, i) => {
    const x = gx + (i % cols) * (size + gap);
    const y = gy + Math.floor(i / cols) * (size + gap);
    return glyph(name, x, y, size, color(name));
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  <text x="${88 * s}" y="${236 * s}" font-family='${FONT}' font-size="${76 * s}" font-weight="700" fill="${FG}">OpenWeb Icons</text>
  <text x="${88 * s}" y="${296 * s}" font-family='${FONT}' font-size="${26 * s}" fill="${MUTED}">Logos of open communities, standards and projects</text>
  ${field}
</svg>
`;
}

// --- Icon -------------------------------------------------------------------

// Four glyphs for the four corners of the open web the set covers.
const CORNERS = ['activitypub', 'fediverse', 'cc', 'feed'];

function icon(w) {
  const s = w / 512;
  const size = 168 * s, gap = 40 * s;
  const off = (w - (2 * size + gap)) / 2;
  const glyphs = CORNERS.map((name, i) =>
    glyph(name, off + (i % 2) * (size + gap), off + Math.floor(i / 2) * (size + gap), size, FG)
  ).join('\n  ');
  // No background: the icon sits on whatever the plugin directory draws it on.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}">
  ${glyphs}
</svg>
`;
}

// --- Write ------------------------------------------------------------------

const files = {
  'banner-1544x500.svg': banner(1544, 500),
  'icon.svg': icon(512),
};
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, name), svg);
}

const png = (svg, out, w) =>
  execFileSync('rsvg-convert', ['-w', String(w), '-o', join(OUT, out), join(OUT, svg)]);

png('banner-1544x500.svg', 'banner-1544x500.png', 1544);
png('banner-1544x500.svg', 'banner-772x250.png', 772);
png('icon.svg', 'icon-512x512.png', 512);
png('icon.svg', 'icon-256x256.png', 256);

console.log('Wrote banner and icon to .wordpress-org/');
