#!/usr/bin/env bash
# Build the Apohara PROBANT pitch deck PDF from the HTML source.
# Self-contained: only requires Google Chrome (>= 100). Run from anywhere;
# resolves the source HTML relative to the script directory.
#
# Usage:   bash build.sh
# Output:  apohara-probant-pitch-deck.pdf next to index.html
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${HERE}/index.html"
OUT="${HERE}/apohara-probant-pitch-deck.pdf"

if [ ! -f "${SRC}" ]; then
  echo "ERROR: source HTML not found at ${SRC}" >&2
  exit 1
fi

# Chrome flags:
# - --headless=new          : modern headless mode (Chrome >= 109)
# - --no-sandbox            : works in sandboxed dev environments
# - --disable-gpu           : avoid GPU init in headless context
# - --hide-scrollbars       : no scrollbar artifacts in render
# - --no-pdf-header-footer  : drop Chrome's auto URL/page-number header
# - --print-to-pdf-no-header: same intent, older flag name (defensive duplicate)
# - --virtual-time-budget   : wait up to 10 s for Google Fonts to load
# - --run-all-compositor-stages-before-draw : force layout before snapshot

google-chrome \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --hide-scrollbars \
  --no-pdf-header-footer \
  --print-to-pdf-no-header \
  --virtual-time-budget=10000 \
  --run-all-compositor-stages-before-draw \
  --print-to-pdf="${OUT}" \
  "file://${SRC}" 2>&1 | grep -vE '^$|fontconfig|libva|GPU' || true

if [ -f "${OUT}" ]; then
  size=$(du -h "${OUT}" | cut -f1)
  echo "✓ wrote ${OUT} (${size})"
else
  echo "ERROR: PDF was not produced" >&2
  exit 1
fi
