#!/usr/bin/env bash
#
# Builds the installable plugin zip.
#
# The repository is the plugin, but it is also the webfont sources, the npm
# package and the Composer component, so most of it does not belong in the
# zip. .distignore says what to leave out, the same file wordpress.org tooling
# reads, and the folder inside the zip has to be named after the plugin slug.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="openwebicons"
OUT="$ROOT/dist"

rm -rf "$OUT"
mkdir -p "$OUT/$SLUG"

rsync -a \
	--exclude=".git" \
	--exclude="dist" \
	--exclude="node_modules" \
	--exclude-from="$ROOT/.distignore" \
	"$ROOT/" "$OUT/$SLUG/"

( cd "$OUT" && zip -rq "$SLUG.zip" "$SLUG" )

echo "Built dist/$SLUG.zip"
