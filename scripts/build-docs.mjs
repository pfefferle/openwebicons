#!/usr/bin/env node
/**
 * Copies the stylesheet and the fonts into docs/ for GitHub Pages.
 *
 * The CSS points at ../font/ because it sits in css/; in docs/ the fonts are
 * one level down instead, so the paths get rewritten on the way.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DOCS = join(ROOT, 'docs');
const FONT_TYPES = ['woff2', 'woff', 'ttf', 'eot', 'svg'];

mkdirSync(join(DOCS, 'font'), { recursive: true });

const css = readFileSync(join(ROOT, 'css', 'openwebicons.css'), 'utf8');
writeFileSync(join(DOCS, 'openwebicons.css'), css.replaceAll('../font/', 'font/'));

for (const type of FONT_TYPES) {
  copyFileSync(
    join(ROOT, 'font', `openwebicons.${type}`),
    join(DOCS, 'font', `openwebicons.${type}`)
  );
}

console.log(`  docs/openwebicons.css and ${FONT_TYPES.length} font files copied`);
