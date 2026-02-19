#!/usr/bin/env node
/**
 * Generates sass/_vars.scss from icons.json.
 * Produces the exact $icons list format consumed by the existing SCSS mixins.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const iconsData = JSON.parse(readFileSync(join(ROOT, 'icons.json'), 'utf8'));

const entries = [];

// 1. Regular icons (SVG file → codepoint)
for (const [name, meta] of Object.entries(iconsData.icons)) {
  const codepoint = meta.codepoint.replace('0x', '\\');
  const color = meta.color ? `"${meta.color}"` : '"monochrome"';
  entries.push(`        ${name} "${codepoint}" ${color}`);
}

// 2. Aliases (CSS class → reuses another icon's codepoint)
for (const [name, meta] of Object.entries(iconsData.aliases)) {
  const target = iconsData.icons[meta.aliasOf];
  if (!target) {
    console.error(`WARNING: alias "${name}" references unknown icon "${meta.aliasOf}"`);
    continue;
  }
  const codepoint = target.codepoint.replace('0x', '\\');
  const color = meta.color ? `"${meta.color}"` : '"monochrome"';
  entries.push(`        ${name} "${codepoint}" ${color}`);
}

// 3. Compositions (CSS class → multiple codepoints)
for (const [name, meta] of Object.entries(iconsData.compositions)) {
  const codepoints = meta.glyphs.map(g => {
    const icon = iconsData.icons[g];
    if (!icon) {
      console.error(`WARNING: composition "${name}" references unknown glyph "${g}"`);
      return '\\ffff';
    }
    return icon.codepoint.replace('0x', '\\');
  });
  const color = meta.color ? `"${meta.color}"` : '"monochrome"';
  entries.push(`        ${name} "${codepoints.join(' ')}" ${color}`);
}

const scss = `// Auto-generated from icons.json — do not edit manually
$icons: ${entries.join(',\n')};
`;

writeFileSync(join(ROOT, 'sass', '_vars.scss'), scss);
console.log(`Generated sass/_vars.scss with ${entries.length} entries`);
