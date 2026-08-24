import { parse } from 'svgson';
import svgpath from 'svgpath';

/**
 * Flattens an icon SVG to a bare <svg><path/>…</svg> with no groups and no
 * transforms: every ancestor transform is baked into the path data.
 *
 * WordPress 7.1's Icon Registration API strips any element that is not <svg>,
 * <path> or <polygon>. A <g transform> would therefore not merely be
 * unwrapped — its contents would be silently displaced.
 *
 * The source viewBox is preserved. Forcing every icon into a single viewBox
 * would rescale the handful authored wider than 1034 units, shrinking them in
 * the webfont for no benefit: a viewBox is self-describing, so inline SVG
 * consumers render a wider icon correctly on their own.
 */
export async function normalizeSvg(source) {
  const tree = await parse(source);
  const viewBox = tree.attributes?.viewBox;
  const paths = [];

  const walk = (node, transforms, fill) => {
    const attrs = node.attributes || {};
    const next = attrs.transform ? [...transforms, attrs.transform] : transforms;
    const nextFill = attrs.fill ?? fill;

    if (node.name === 'path' && attrs.d) {
      let d = svgpath(attrs.d);
      if (next.length) d = d.transform(next.join(' '));
      paths.push(`<path fill="${nextFill ?? 'currentColor'}" d="${d.round(3).toString()}"/>`);
    }
    for (const child of node.children || []) walk(child, next, nextFill);
  };
  walk(tree, [], undefined);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`,
    ...paths.map(p => `  ${p}`),
    '</svg>',
  ].join('\n');
}
