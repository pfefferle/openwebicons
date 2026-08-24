#!/usr/bin/env node
/**
 * Generates composed/<name>.svg for every entry in the compositions section.
 *
 * A composition is several glyphs shown next to each other. The webfont gets
 * that for free by putting the codepoints in one CSS `content` string, so the
 * glyphs advance like characters. Inline SVG has no such thing, and WordPress
 * strips <g> and transform attributes, so each glyph has to be shifted into
 * its slot inside the path data itself.
 *
 * Written to composed/ rather than svg/ so fantasticon does not pick them up
 * as extra glyphs.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import svgpath from 'svgpath';
import { normalizeSvg } from './lib/normalize-svg.mjs';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'composed');

// The font advances every glyph by its default width, so the slots are even.
const ADVANCE = 1092;
const HEIGHT = 1024;

const data = JSON.parse(readFileSync(join(ROOT, 'icons.json'), 'utf8'));

const glyph = async (name) => {
  const svg = await normalizeSvg(readFileSync(join(ROOT, 'svg', `${name}.svg`), 'utf8'));

  // Without these the offsets silently come out as NaN, and the composed file
  // is written anyway. Fail loudly instead.
  const viewBox = svg.match(/viewBox="([^"]*)"/);
  if (!viewBox) {
    throw new Error(`svg/${name}.svg has no viewBox`);
  }

  const box = viewBox[1].trim().split(/[\s,]+/).map(Number);
  if (box.length !== 4 || box.some(Number.isNaN)) {
    throw new Error(`svg/${name}.svg needs a viewBox of four numbers, got "${viewBox[1]}"`);
  }

  const paths = [...svg.matchAll(/ d="([^"]+)"/g)].map(m => m[1]);
  if (!paths.length) {
    throw new Error(`svg/${name}.svg has no paths`);
  }

  const [x, , width] = box;
  return { x, width, paths };
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let count = 0;
for (const [name, meta] of Object.entries(data.compositions)) {
  const glyphs = [];
  for (const g of meta.glyphs) {
    glyphs.push(await glyph(g));
  }

  const paths = glyphs.flatMap((g, index) => {
    // Centre each glyph in its slot, the way the font centres it in the em box.
    const offset = index * ADVANCE + (ADVANCE - g.width) / 2 - g.x;
    return g.paths.map(d =>
      `  <path fill="currentColor" d="${svgpath(d).translate(offset, 0).round(3).toString()}"/>`
    );
  });

  writeFileSync(
    join(OUT, `${name}.svg`),
    [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${glyphs.length * ADVANCE} ${HEIGHT}">`,
      ...paths,
      '</svg>',
      '',
    ].join('\n')
  );
  count++;
}

console.log(`Generated ${count} composed icons in composed/`);
