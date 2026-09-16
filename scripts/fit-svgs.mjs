#!/usr/bin/env node
/**
 * Fits the glyph of one or more icons into the shared icon box.
 *
 * Most icons draw within an 850 unit square at (75, 175) of the 1024 glyph
 * space; that leaves room for the font's descent and keeps optical sizes
 * consistent. Paths that reach outside the viewBox get clipped wherever the
 * SVG is used directly (the WordPress Icon block, inline SVG), even though
 * the webfont still renders them, so a misplaced icon is easy to miss.
 *
 * Usage: node scripts/fit-svgs.mjs lemmy misskey …
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import svgpath from 'svgpath';
import { normalizeSvg } from './lib/normalize-svg.mjs';
import { svgBBox } from './lib/svg-bbox.mjs';

const SVG_DIR = join(import.meta.dirname, '..', 'svg');

const BOX = { x: 75, y: 175, size: 850 };

const names = process.argv.slice(2);
if (!names.length) {
  console.error('Usage: node scripts/fit-svgs.mjs <icon-name> …');
  process.exit(1);
}

for (const name of names) {
  const file = join(SVG_DIR, `${name}.svg`);
  const flat = await normalizeSvg(readFileSync(file, 'utf8'));
  const box = svgBBox(flat);
  if (!box) {
    console.error(`${name}: no path data`);
    process.exitCode = 1;
    continue;
  }

  const scale = BOX.size / Math.max(box.w, box.h);
  const tx = BOX.x + (BOX.size - box.w * scale) / 2 - box.x * scale;
  const ty = BOX.y + (BOX.size - box.h * scale) / 2 - box.y * scale;
  const matrix = `matrix(${scale} 0 0 ${scale} ${tx} ${ty})`;

  const fitted = flat.replace(/<path([^>]*)\sd="([^"]+)"/g, (_, attrs, d) =>
    `<path${attrs} d="${svgpath(d).transform(matrix).round(3).toString()}"`);

  writeFileSync(file, fitted + '\n');
  const after = svgBBox(fitted);
  console.log(`${name}: ${fmt(box)} → ${fmt(after)} (scale ${scale.toFixed(3)})`);
}

function fmt(b) {
  return `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}×${Math.round(b.h)}`;
}
