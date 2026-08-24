#!/usr/bin/env node
/**
 * Rewrites svg/ in place so every icon is a flat <svg><path/>…</svg>.
 *
 * Source icons accumulated <g transform> wrappers over the years. The webfont
 * build resolves those itself, but WordPress 7.1's Icon Registration API
 * strips any element that is not <svg>, <path> or <polygon> — which would not
 * merely unwrap a transformed group, it would silently displace its contents.
 * Baking the transforms into the path data keeps a single source of truth that
 * every consumer can read directly.
 *
 * The transform is geometry-preserving: scripts/verify-svgs.mjs rasterises
 * before and after and asserts the renders are identical.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeSvg } from './lib/normalize-svg.mjs';

const SVG_DIR = join(import.meta.dirname, '..', 'svg');

const files = readdirSync(SVG_DIR)
  .filter(f => f.endsWith('.svg') && !f.startsWith('_'));

let changed = 0;
for (const file of files) {
  const path = join(SVG_DIR, file);
  const before = readFileSync(path, 'utf8');
  const after = await normalizeSvg(before) + '\n';
  if (before !== after) {
    writeFileSync(path, after);
    changed++;
  }
}

console.log(`Normalized ${changed} of ${files.length} SVG files`);
