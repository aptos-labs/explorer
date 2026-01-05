#!/bin/bash
# Generate PNG favicons and icons from SVG sources
# Requires: rsvg-convert (librsvg), imagemagick (for .ico)
#
# Usage: ./scripts/generate-icons.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$PROJECT_DIR/public"

echo "Generating icons from SVG sources..."

# Check for required tools
if ! command -v rsvg-convert &> /dev/null; then
    echo "Error: rsvg-convert not found. Install with: brew install librsvg"
    exit 1
fi

if ! command -v magick &> /dev/null; then
    echo "Error: imagemagick not found. Install with: brew install imagemagick"
    exit 1
fi

# Generate PNG favicons from favicon-light.svg
echo "  → apple-touch-icon.png (180x180)"
rsvg-convert -w 180 -h 180 "$PUBLIC_DIR/favicon-light.svg" -o "$PUBLIC_DIR/apple-touch-icon.png"

echo "  → favicon-192.png (192x192)"
rsvg-convert -w 192 -h 192 "$PUBLIC_DIR/favicon-light.svg" -o "$PUBLIC_DIR/favicon-192.png"

echo "  → favicon-512.png (512x512)"
rsvg-convert -w 512 -h 512 "$PUBLIC_DIR/favicon-light.svg" -o "$PUBLIC_DIR/favicon-512.png"

# Generate OG image from og-image.svg
echo "  → og-image.png (1200x630)"
rsvg-convert -w 1200 -h 630 "$PUBLIC_DIR/og-image.svg" -o "$PUBLIC_DIR/og-image.png"

# Generate favicon.ico (multi-size)
echo "  → favicon.ico (16x16, 32x32, 48x48)"
TMPDIR=$(mktemp -d)
rsvg-convert -w 16 -h 16 "$PUBLIC_DIR/favicon-light.svg" -o "$TMPDIR/favicon-16.png"
rsvg-convert -w 32 -h 32 "$PUBLIC_DIR/favicon-light.svg" -o "$TMPDIR/favicon-32.png"
rsvg-convert -w 48 -h 48 "$PUBLIC_DIR/favicon-light.svg" -o "$TMPDIR/favicon-48.png"
magick "$TMPDIR/favicon-16.png" "$TMPDIR/favicon-32.png" "$TMPDIR/favicon-48.png" "$PUBLIC_DIR/favicon.ico"
rm -rf "$TMPDIR"

echo ""
echo "✓ All icons generated successfully!"

