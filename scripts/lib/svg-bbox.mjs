import svgpath from 'svgpath';

/**
 * Returns the bounding box of every <path d> in an SVG string, in the
 * coordinate space of the file.
 *
 * Curves are sampled rather than solved analytically; with 50 samples per
 * segment the error is well under one unit in the 1024 glyph space, which
 * is all the fit and validation steps need.
 *
 * @param {string} source SVG markup.
 * @return {{x:number,y:number,w:number,h:number}|null} Box, or null without paths.
 */
export function svgBBox(source) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const add = (x, y) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  const STEPS = 50;

  for (const [, d] of source.matchAll(/<path[^>]*\sd="([^"]+)"/g)) {
    let cx = 0, cy = 0;
    svgpath(d).abs().unshort().unarc().iterate((seg) => {
      const cmd = seg[0];
      if (cmd === 'M' || cmd === 'L' || cmd === 'T') {
        cx = seg[1]; cy = seg[2]; add(cx, cy);
      } else if (cmd === 'H') {
        cx = seg[1]; add(cx, cy);
      } else if (cmd === 'V') {
        cy = seg[1]; add(cx, cy);
      } else if (cmd === 'C') {
        const [, x1, y1, x2, y2, x, y] = seg;
        for (let i = 0; i <= STEPS; i++) {
          const t = i / STEPS, m = 1 - t;
          add(m ** 3 * cx + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t ** 3 * x,
              m ** 3 * cy + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t ** 3 * y);
        }
        cx = x; cy = y;
      } else if (cmd === 'Q') {
        const [, x1, y1, x, y] = seg;
        for (let i = 0; i <= STEPS; i++) {
          const t = i / STEPS, m = 1 - t;
          add(m * m * cx + 2 * m * t * x1 + t * t * x, m * m * cy + 2 * m * t * y1 + t * t * y);
        }
        cx = x; cy = y;
      }
      // 'Z' closes to the subpath start, which was already added.
    });
  }

  if (minX === Infinity) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Parses a viewBox attribute into numbers.
 *
 * @param {string} source SVG markup.
 * @return {{x:number,y:number,w:number,h:number}|null}
 */
export function svgViewBox(source) {
  const m = source.match(/viewBox="([^"]+)"/);
  if (!m) return null;
  const [x, y, w, h] = m[1].trim().split(/[\s,]+/).map(Number);
  return { x, y, w, h };
}
