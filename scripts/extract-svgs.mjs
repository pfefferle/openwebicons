#!/usr/bin/env node
/**
 * One-time script to extract missing SVGs from font/openwebicons.svg.
 * Font SVGs use a flipped Y-axis (ascent=1024, descent=0).
 * Standalone SVGs need Y coordinates transformed: y → 1024 - y, dy → -dy.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const fontSvg = readFileSync(join(ROOT, 'font', 'openwebicons.svg'), 'utf8');
const svgDir = join(ROOT, 'svg');

// Map of codepoint → desired filename (only glyphs missing a standalone SVG)
const missing = {
  'f095': 'freesoftware',
};

/**
 * Flip an SVG path's Y-axis for font → standalone conversion.
 * In font coordinates: origin at bottom-left, Y increases upward.
 * In standalone SVG: origin at top-left, Y increases downward.
 * Transform: absolute Y → 1024 - Y, relative dY → -dY.
 */
function flipPathY(d, height = 1024) {
  // Tokenize the path data
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g);
  if (!tokens) return d;

  let result = '';
  let i = 0;
  let currentCmd = '';

  while (i < tokens.length) {
    const token = tokens[i];

    if (/^[a-zA-Z]$/.test(token)) {
      currentCmd = token;
      result += token;
      i++;
      continue;
    }

    const cmd = currentCmd;
    const isRelative = cmd === cmd.toLowerCase();
    const cmdUpper = cmd.toUpperCase();

    switch (cmdUpper) {
      case 'M': // x,y
      case 'L': // x,y
      case 'T': // x,y (smooth quadratic)
      {
        const x = tokens[i];
        const y = tokens[i + 1];
        if (isRelative) {
          result += `${x} ${-parseFloat(y)}`;
        } else {
          result += `${x} ${height - parseFloat(y)}`;
        }
        i += 2;
        break;
      }
      case 'H': // x
      {
        result += tokens[i];
        i += 1;
        break;
      }
      case 'V': // y
      {
        const y = tokens[i];
        if (isRelative) {
          result += `${-parseFloat(y)}`;
        } else {
          result += `${height - parseFloat(y)}`;
        }
        i += 1;
        break;
      }
      case 'C': // x1,y1 x2,y2 x,y
      {
        const x1 = tokens[i], y1 = tokens[i + 1];
        const x2 = tokens[i + 2], y2 = tokens[i + 3];
        const x = tokens[i + 4], y = tokens[i + 5];
        if (isRelative) {
          result += `${x1} ${-parseFloat(y1)} ${x2} ${-parseFloat(y2)} ${x} ${-parseFloat(y)}`;
        } else {
          result += `${x1} ${height - parseFloat(y1)} ${x2} ${height - parseFloat(y2)} ${x} ${height - parseFloat(y)}`;
        }
        i += 6;
        break;
      }
      case 'S': // x2,y2 x,y (smooth cubic)
      {
        const x2 = tokens[i], y2 = tokens[i + 1];
        const x = tokens[i + 2], y = tokens[i + 3];
        if (isRelative) {
          result += `${x2} ${-parseFloat(y2)} ${x} ${-parseFloat(y)}`;
        } else {
          result += `${x2} ${height - parseFloat(y2)} ${x} ${height - parseFloat(y)}`;
        }
        i += 4;
        break;
      }
      case 'Q': // x1,y1 x,y
      {
        const x1 = tokens[i], y1 = tokens[i + 1];
        const x = tokens[i + 2], y = tokens[i + 3];
        if (isRelative) {
          result += `${x1} ${-parseFloat(y1)} ${x} ${-parseFloat(y)}`;
        } else {
          result += `${x1} ${height - parseFloat(y1)} ${x} ${height - parseFloat(y)}`;
        }
        i += 4;
        break;
      }
      case 'A': // rx ry x-rotation large-arc sweep x y
      {
        const rx = tokens[i], ry = tokens[i + 1];
        const xrot = tokens[i + 2];
        const largeArc = tokens[i + 3];
        const sweep = tokens[i + 4];
        const x = tokens[i + 5], y = tokens[i + 6];
        // Flip sweep flag and Y
        const newSweep = sweep === '0' ? '1' : '0';
        if (isRelative) {
          result += `${rx} ${ry} ${xrot} ${largeArc} ${newSweep} ${x} ${-parseFloat(y)}`;
        } else {
          result += `${rx} ${ry} ${xrot} ${largeArc} ${newSweep} ${x} ${height - parseFloat(y)}`;
        }
        i += 7;
        break;
      }
      case 'Z':
        // Z has no parameters, already handled
        i++;
        break;
      default:
        // Unknown command, pass through
        result += tokens[i];
        i++;
    }

    // Add space between coordinate groups
    if (i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i])) {
      result += ' ';
    }
  }

  return result;
}

// Extract glyphs from font SVG
for (const [codepoint, name] of Object.entries(missing)) {
  const outFile = join(svgDir, `${name}.svg`);
  if (existsSync(outFile)) {
    console.log(`  Skipping ${name}.svg (already exists)`);
    continue;
  }

  const unicodeEntity = `&#x${codepoint};`;
  const re = new RegExp(`<glyph\\s+unicode="${unicodeEntity}"[^>]*\\sd="([^"]+)"`, 's');
  const match = fontSvg.match(re);

  if (!match) {
    console.error(`  ERROR: No glyph found for ${unicodeEntity} (${name})`);
    continue;
  }

  const fontPath = match[1];
  const flippedPath = flipPathY(fontPath);

  const svg = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="-10 0 1034 1024">
   <path fill="currentColor"
d="${flippedPath}" />
</svg>
`;

  writeFileSync(outFile, svg);
  console.log(`  Extracted ${name}.svg (U+${codepoint.toUpperCase()})`);
}

console.log('Done!');
