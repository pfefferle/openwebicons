# Contributing to OpenWeb Icons

Thank you for your interest in contributing! This guide explains how to add new icons and work with the project.

## Adding a New Icon

1. **Copy the template SVG**

   ```bash
   cp svg/_template.svg svg/your-icon.svg
   ```

2. **Design your icon**

   - Work within the 1024×1024 glyph space (viewBox is `-10 0 1034 1024`)
   - Use `fill="currentColor"` on your paths — this lets the icon inherit text color
   - Use only filled paths — no strokes, embedded images, or text elements
   - Keep paths as simple as possible

3. **Add an entry to `icons.json`**

   Add your icon to the `icons` object with the next available codepoint and an optional brand color:

   ```json
   "your-icon": {
     "codepoint": "0xf0c9",
     "color": "#FF6600"
   }
   ```

   Codepoints must be in the private use area (`0xf000`–`0xf0ff`). Check the existing entries to find the next available one.

4. **Add to a group**

   Add your icon's name to the appropriate group in the `groups` section of `icons.json`. If no existing group fits, add it to "Other" or create a new group.

5. **Validate**

   ```bash
   npm run validate
   ```

   This checks your SVG format and `icons.json` consistency. Fix any reported errors.

6. **Build locally**

   ```bash
   npm run build
   ```

   This generates fonts, SCSS, CSS, and docs. Verify the build succeeds.

7. **Open a pull request**

   CI will automatically validate your changes. When merged, the generated outputs (fonts, CSS, docs) are rebuilt and committed automatically — you don't need to include them in your PR.

## SVG Guidelines

- **viewBox**: Must be `"-10 0 1034 1024"` — all icons use this coordinate space
- **fill**: Use `fill="currentColor"` so icons adapt to text color
- **No strokes**: Convert all strokes to filled paths
- **No embedded images**: Raster images cannot be converted to font glyphs
- **No text elements**: Convert text to paths
- **Keep it simple**: Fewer path points means smaller font files and better rendering

## icons.json Format

The file has four sections:

### `icons`

Each icon maps to a codepoint and optional color:

```json
"icon-name": {
  "codepoint": "0xf000",
  "color": "#FF6600"
}
```

### `aliases`

Alternative names that reference an existing icon:

```json
"alias-name": {
  "aliasOf": "icon-name",
  "color": "#FF6600"
}
```

### `compositions`

Multi-glyph icons built from existing icons:

```json
"composed-name": {
  "glyphs": ["icon-part-1", "icon-part-2"]
}
```

### `groups`

Logical groupings for documentation and the style guide:

```json
"Group Name": ["icon-a", "icon-b", "icon-c"]
```

## Color Convention

- Add a `color` property when the icon represents a project/brand with an official color
- Use hex format (e.g., `"#FF6600"`)
- Colors are used in documentation and the style guide — the font glyphs themselves are always monochrome

## Naming Convention

- Use **lowercase** letters, digits, and **hyphens** only (e.g., `my-icon.svg`)
- Match the project or protocol name where possible
- Use `-simple` suffix for simplified/outline variants (e.g., `mastodon-simple`)

## Building Locally

```bash
npm install
npm run build
```

This runs the full pipeline: font generation → SCSS → CSS → docs.

To validate without building:

```bash
npm run validate
```

## Trademark Note

The logos and icons included in this project are trademarks of their respective owners. They are provided here for identification purposes only. Inclusion does not imply endorsement by the trademark holders.
