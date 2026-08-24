[![npm](https://img.shields.io/npm/v/openwebicons.svg)](https://www.npmjs.com/package/openwebicons) [![npm](https://img.shields.io/npm/l/openwebicons.svg)](https://www.npmjs.com/package/openwebicons) [![npm](https://img.shields.io/npm/dt/openwebicons.svg)](https://www.npmjs.com/package/openwebicons)

# OpenWeb Icons

The *OpenWeb Icons* is a web-font that gives you scalable vector icons/logos of some open communities, standards or projects.

It includes the Creative Commons-, HTML5- and Microformats-icons for example. Use them to show your love for the *Open Web*!

The icons come in three shapes: a web-font with CSS, the plain SVG files, and a WordPress plugin.

## Installation

npm ([npmjs.org](https://www.npmjs.org/package/openwebicons))

    $ npm install openwebicons

## Usage

Include the CSS in your project:

```html
<link rel="stylesheet" href="node_modules/openwebicons/css/openwebicons.min.css">
```

Then use icons with CSS classes:

```html
<i class="icon-html5"></i>
<i class="icon-mastodon"></i>
<i class="icon-activitypub"></i>
<i class="icon-fediverse"></i>
```

For colored variants, append `-colored`:

```html
<i class="icon-html5-colored"></i>
<i class="icon-mastodon-colored"></i>
```

## WordPress

The repository is also a WordPress plugin. It registers every icon with the icon library that came with WordPress 7.1, so you can pick them in the Icon block like any other icon. It loads no font and no stylesheet, the icons are plain SVG and follow the text color.

There is no release on wordpress.org yet. Build the zip with `npm run build:plugin` and install it from `dist/openwebicons.zip`, or take it from a [release](https://github.com/pfefferle/openwebicons/releases) once one is tagged.

To render an icon in a template:

```php
<?php echo wp_get_icon( 'openwebicons/activitypub', array( 'size' => 32 ) ); ?>
```

## Building from Source

```bash
npm install
npm run build
```

This generates fonts, SCSS variables, CSS files, the composed icons and the demo page.

### Build Steps

| Command | Description |
|---------|-------------|
| `npm run build:fonts` | Generate font files from SVGs + docs HTML via fantasticon |
| `npm run build:scss` | Generate `sass/_vars.scss` from `icons.json` |
| `npm run build:css` | Compile SCSS to CSS (expanded + minified) |
| `npm run build:compositions` | Generate `composed/` for the multi-glyph icons |
| `npm run build:docs` | Copy CSS + fonts to `docs/` for GitHub Pages |
| `npm run build` | Run all of the above in sequence |

### Other Commands

| Command | Description |
|---------|-------------|
| `npm run validate` | Check the SVGs, `icons.json` and the version numbers |
| `npm run normalize:svg` | Flatten the transforms in `svg/` into the path data |
| `npm run build:plugin` | Build `dist/openwebicons.zip`, the installable plugin |
| `npm run env-start` | Start a WordPress at http://localhost:8893 (needs Docker) |
| `npm run env-stop` | Stop it again |

## Contributing

Adding a new icon:

1. Add your SVG to `svg/` (viewBox `"-10 0 1034 1024"`, `fill="currentColor"`)
2. Run `npm run normalize:svg`, WordPress strips groups and transforms, so the paths have to be flat
3. Add an entry to `icons.json` with a label, the next available codepoint and an optional color
4. Run `npm run validate` and `npm run build`
5. Commit the SVG, `icons.json`, and all generated output files
6. Open a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for the details.

## Project Page

Browse all icons: https://pfefferle.dev/openwebicons/

---

[![NPM](https://nodei.co/npm/openwebicons.png?downloads=true&stars=true)](https://nodei.co/npm/openwebicons/)
