# wordpress.org assets

Images for the plugin page. `.github/workflows/assets.yml` pushes them to the
`assets/` directory of the SVN repository whenever they change on `main`.

The banner and the icon are rendered from the plugin's own glyphs with
`npm run build:wporg-assets` (needs `rsvg-convert` from librsvg). Edit
`scripts/build-wporg-assets.mjs` and rerun it instead of touching the PNGs.

| File | Size |
|------|------|
| `icon.svg`, `icon-256x256.png`, `icon-512x512.png` | plugin icon |
| `banner-772x250.png`, `banner-1544x500.png` | plugin page header |
| `screenshot-N.png` | captions are in `== Screenshots ==` of `readme.txt` |
