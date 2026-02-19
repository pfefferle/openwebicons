#!/usr/bin/env node
/**
 * Compiles all SCSS variants to CSS using Dart Sass programmatic API.
 */
import * as sass from 'sass';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

mkdirSync(join(ROOT, 'css'), { recursive: true });

const builds = [
  // [input, output, style]
  ['sass/openwebicons.scss', 'css/openwebicons.css', 'expanded'],
  ['sass/openwebicons.scss', 'css/openwebicons.min.css', 'compressed'],
  ['sass/openwebicons-bootstrap.scss', 'css/openwebicons-bootstrap.css', 'expanded'],
  ['sass/openwebicons-bootstrap.scss', 'css/openwebicons-bootstrap.min.css', 'compressed'],
  ['sass/openwebicons-cdn.scss', 'css/openwebicons-cdn.css', 'expanded'],
  ['sass/openwebicons-cdn.scss', 'css/openwebicons-cdn.min.css', 'compressed'],
  ['sass/weloveiconfonts.scss', 'css/weloveiconfonts.css', 'compressed'],
];

for (const [input, output, style] of builds) {
  try {
    const result = sass.compile(join(ROOT, input), { style });
    writeFileSync(join(ROOT, output), result.css);
    console.log(`  ${output}`);
  } catch (err) {
    console.error(`  ERROR compiling ${input}:`, err.message);
    process.exit(1);
  }
}

console.log('CSS compilation complete');
