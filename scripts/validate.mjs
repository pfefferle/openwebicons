import { readFileSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const SVG_DIR = join(import.meta.dirname, '..', 'svg');
const ICONS_JSON = join(import.meta.dirname, '..', 'icons.json');

const errors = [];
const warnings = [];

function error(msg) {
  errors.push(msg);
  console.error(`  ERROR: ${msg}`);
}

function warn(msg) {
  warnings.push(msg);
  console.warn(`  WARN:  ${msg}`);
}

// --- Load icons.json ---
let data;
try {
  data = JSON.parse(readFileSync(ICONS_JSON, 'utf8'));
} catch (e) {
  console.error(`FATAL: icons.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

const { icons = {}, aliases = {}, compositions = {}, groups = {} } = data;

// --- Collect SVG files (skip files starting with _) ---
const svgFiles = readdirSync(SVG_DIR)
  .filter(f => extname(f) === '.svg' && !f.startsWith('_'));

// --- SVG checks ---
console.log('Validating SVG files...');
const FILENAME_RE = /^[a-z0-9][a-z0-9-]*\.svg$/;

for (const file of svgFiles) {
  const filePath = join(SVG_DIR, file);

  // Filename pattern
  if (!FILENAME_RE.test(file)) {
    error(`${file}: filename must be lowercase letters, digits, and hyphens only`);
  }

  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch (e) {
    error(`${file}: could not read file: ${e.message}`);
    continue;
  }

  // Valid XML: basic well-formedness check — must have <svg> and closing </svg>
  if (!/<svg[\s>]/.test(content) || !/<\/svg\s*>/.test(content)) {
    error(`${file}: not valid SVG (missing <svg> or </svg>)`);
    continue;
  }

  // Check viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
  if (!viewBoxMatch) {
    error(`${file}: missing viewBox attribute`);
  } else if (viewBoxMatch[1] !== '-10 0 1034 1024') {
    warn(`${file}: viewBox should be "-10 0 1034 1024", got "${viewBoxMatch[1]}"`);
  }

  // Check fill="currentColor"
  if (!content.includes('fill="currentColor"')) {
    error(`${file}: missing fill="currentColor"`);
  }

  // Check at least one <path>
  if (!/<path[\s>]/.test(content)) {
    error(`${file}: must contain at least one <path> element`);
  }
}

// --- icons.json checks ---
console.log('Validating icons.json...');

const svgNames = new Set(svgFiles.map(f => basename(f, '.svg')));

// Every icon in icons.json must have a matching SVG
for (const name of Object.keys(icons)) {
  if (!svgNames.has(name)) {
    error(`icons.json: icon "${name}" has no matching svg/${name}.svg`);
  }
}

// Every SVG (except monkey.svg) must have an entry in icons.json
for (const name of svgNames) {
  if (name === 'monkey') continue;
  if (!icons[name]) {
    error(`svg/${name}.svg has no entry in icons.json`);
  }
}

// All codepoints must be unique and in private use area
const codepoints = new Map();
for (const [name, entry] of Object.entries(icons)) {
  const cp = entry.codepoint;
  if (!cp) {
    error(`icons.json: icon "${name}" missing codepoint`);
    continue;
  }

  const num = parseInt(cp, 16);
  if (isNaN(num) || num < 0xf000 || num > 0xf0ff) {
    error(`icons.json: icon "${name}" codepoint ${cp} is not in private use area (0xf000-0xf0ff)`);
  }

  if (codepoints.has(cp)) {
    error(`icons.json: duplicate codepoint ${cp} used by "${codepoints.get(cp)}" and "${name}"`);
  }
  codepoints.set(cp, name);
}

// Aliases must reference existing icons
for (const [name, entry] of Object.entries(aliases)) {
  if (!icons[entry.aliasOf]) {
    error(`icons.json: alias "${name}" references non-existent icon "${entry.aliasOf}"`);
  }
}

// Compositions must reference existing icons
for (const [name, entry] of Object.entries(compositions)) {
  for (const glyph of entry.glyphs || []) {
    if (!icons[glyph]) {
      error(`icons.json: composition "${name}" references non-existent icon "${glyph}"`);
    }
  }
}

// Group entries must reference existing icons, aliases, or compositions
const allNames = new Set([
  ...Object.keys(icons),
  ...Object.keys(aliases),
  ...Object.keys(compositions),
]);

for (const [groupName, members] of Object.entries(groups)) {
  for (const member of members) {
    if (!allNames.has(member)) {
      error(`icons.json: group "${groupName}" references non-existent entry "${member}"`);
    }
  }
}

// --- Summary ---
console.log('');
if (warnings.length > 0) {
  console.warn(`${warnings.length} warning(s).`);
}
if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log('All checks passed.');
  process.exit(0);
}
