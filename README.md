[![npm](https://img.shields.io/npm/v/openwebicons.svg)](https://www.npmjs.com/package/openwebicons) [![npm](https://img.shields.io/npm/l/openwebicons.svg)](https://www.npmjs.com/package/openwebicons) [![npm](https://img.shields.io/npm/dt/openwebicons.svg)](https://www.npmjs.com/package/openwebicons)

# OpenWeb Icons

The *OpenWeb Icons* is a web-font that gives you scalable vector icons/logos of some open communities, standards or projects.

It includes the Creative Commons-, HTML5- and Microformats-icons for example. Use them to show your love for the *Open Web*!

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

## Building from Source

```bash
npm install
npm run build
```

This generates fonts, SCSS variables, CSS files, and the demo page.

### Build Steps

| Command | Description |
|---------|-------------|
| `npm run build:fonts` | Generate font files from SVGs + docs HTML via fantasticon |
| `npm run build:scss` | Generate `sass/_vars.scss` from `icons.json` |
| `npm run build:css` | Compile SCSS to CSS (expanded + minified) |
| `npm run build:docs` | Copy CSS + fonts to `docs/` for GitHub Pages |
| `npm run build` | Run all of the above in sequence |

## Contributing

Adding a new icon:

1. Add your SVG to `svg/` (viewBox `"-10 0 1034 1024"`, `fill="currentColor"`)
2. Add an entry to `icons.json` with the next available codepoint and optional color
3. Run `npm run build`
4. Commit the SVG, `icons.json`, and all generated output files
5. Open a PR

## Project Page

Browse all icons: https://pfefferle.dev/openwebicons/

---

[![NPM](https://nodei.co/npm/openwebicons.png?downloads=true&stars=true)](https://nodei.co/npm/openwebicons/)
