import { readFileSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SVG_DIR = join(ROOT, 'svg');
const ICONS_JSON = join(ROOT, 'icons.json');
const PKG = join(ROOT, 'package.json');
const PLUGIN = join(ROOT, 'openwebicons.php');
const README = join(ROOT, 'readme.txt');
const CHANGELOG = join(ROOT, 'CHANGELOG.md');

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

  // Check viewBox. Width and x-origin legitimately vary — a few icons are
  // authored wider — but every icon has to sit on the same vertical scale, or
  // the composed icons in openwebicons.php would layer out of alignment.
  const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
  if (!viewBoxMatch) {
    error(`${file}: missing viewBox attribute`);
  } else {
    const [, y, , height] = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (y !== 0 || height !== 1024) {
      error(`${file}: viewBox must be "<x> 0 <width> 1024", got "${viewBoxMatch[1]}"`);
    }
  }

  // Check fill="currentColor"
  if (!content.includes('fill="currentColor"')) {
    error(`${file}: missing fill="currentColor"`);
  }

  // Check at least one <path>
  if (!/<path[\s>]/.test(content)) {
    error(`${file}: must contain at least one <path> element`);
  }

  // Icons must be flat: WordPress strips any element that is not <svg>,
  // <path> or <polygon>, so a transformed group would have its contents
  // displaced rather than merely unwrapped.
  if (/<g[\s>]/.test(content)) {
    error(`${file}: contains a <g> element — run "npm run normalize:svg"`);
  }
  if (/transform=/.test(content)) {
    error(`${file}: contains a transform attribute — run "npm run normalize:svg"`);
  }

  // openwebicons.php builds the composed icons by pulling <path/> elements out
  // of these files with a regex, so they have to stay self-closing.
  if (/<path\b[^>]*(?<!\/)>/.test(content)) {
    error(`${file}: <path> must be self-closing — run "npm run normalize:svg"`);
  }
}

// --- icons.json checks ---
console.log('Validating icons.json...');

const svgNames = new Set(svgFiles.map(f => basename(f, '.svg')));

// Every entry needs a label. Icons and compositions are passed to
// wp_register_icon(), which shows the label in the icon library and fails
// without one. Aliases are not registered there, but they are the same kind of
// entry, so the format asks for a label everywhere rather than in two of three
// sections.
const SINGULAR = { icons: 'icon', aliases: 'alias', compositions: 'composition' };
for (const [section, entries] of Object.entries({ icons, aliases, compositions })) {
  for (const [name, entry] of Object.entries(entries)) {
    if (!entry.label) {
      error(`icons.json: ${SINGULAR[section]} "${name}" is missing a label`);
    }
  }
}

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

// --- Version checks ---
// One version for everything: the npm package, the plugin header and the
// readme.txt stable tag all have to agree, and nothing syncs them for us.
console.log('Validating versions...');

const version = JSON.parse(readFileSync(PKG, 'utf8')).version;

function checkVersion(path, pattern, what) {
  const match = readFileSync(path, 'utf8').match(pattern);

  if (!match) {
    error(`${basename(path)}: could not find a ${what}`);
  } else if (match[1] !== version) {
    error(`${basename(path)}: ${what} is ${match[1]}, but package.json is ${version}`);
  }
}

checkVersion(PLUGIN, /^\s*\*\s*Version:\s*(\S+)\s*$/m, 'Version header');
checkVersion(README, /^Stable tag:\s*(\S+)\s*$/m, 'Stable tag');
checkVersion(CHANGELOG, /^## \[(\S+?)\]/m, 'newest entry');

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
