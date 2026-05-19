#!/usr/bin/env bash
# Apohara CONSILIUM — Honesty CI Gate (Milan AI Week 2026)
# Per ralplan consensus Critic + Architect review.
# Scoped to CONSILIUM-active content paths only.
# Legacy/inherited content (AUDIT.md, CHANGELOG.md, docs/glasswing/, docs/submissions/techex*)
# is OUT OF SCOPE — those are historical artifacts from the apohara-probant fork base.
set -u
EXIT=0
REPO_ROOT="${1:-/home/linconx/Documentos/apohara-consilium}"

# CONSILIUM-active paths (where USER-FACING claims live).
# NOTE: docs/adr/ is META-documentation (explains decisions including which
# inflated claims were removed) and is therefore OUT of banned-string scope.
# ADRs may quote the banned strings verbatim when documenting their removal.
ACTIVE_PATHS=(
  "$REPO_ROOT/README.md"
  "$REPO_ROOT/docs/submissions/pitch-deck-milan"
  "$REPO_ROOT/docs/submissions/milan-2026"
  "$REPO_ROOT/docs/infra"
  "$REPO_ROOT/landing"
  "$REPO_ROOT/scripts/check_honesty_consilium.sh"
)

# Corrections table (banned strings in CONSILIUM-active content):
BANNED=(
  '14-vendor'
  '14-seat'
  '49 compliance'
  '49 controls'
  '\$1\.4B'
  '\$1\.4 billion'
  '1\.4B Cisco'
  'court-admissible today'
  'Robust Intelligence \$1'
)

echo "=== check_honesty_consilium.sh — scope: CONSILIUM-active paths ==="

# Rule 1: banned strings in CONSILIUM-active content only
echo "=== Rule 1: corrections-table banned strings (CONSILIUM-active scope) ==="
for pattern in "${BANNED[@]}"; do
  for path in "${ACTIVE_PATHS[@]}"; do
    [ -e "$path" ] || continue
    HITS=$(grep -rnE "$pattern" "$path" \
      --include="*.md" --include="*.html" --include="*.tex" --include="*.txt" --include="*.json" \
      --exclude="check_honesty_consilium.sh" \
      2>/dev/null || true)
    if [ -n "$HITS" ]; then
      echo "VIOLATION: banned string /$pattern/ in CONSILIUM-active content:"
      echo "$HITS"
      EXIT=1
    fi
  done
done
[ $EXIT -eq 0 ] && echo "  ✓ No corrections-table banned strings in CONSILIUM-active content"

# Rule 2: vendor count must be 9 in active content
echo "=== Rule 2: vendor count canonical = 9 (active content) ==="
RULE2_HIT=0
for path in "${ACTIVE_PATHS[@]}"; do
  [ -e "$path" ] || continue
  HITS=$(grep -rnE "(12|13|14)[- ](frontier|seat|vendor)" "$path" \
    --include="*.md" --include="*.html" --include="*.tex" \
    --exclude="check_honesty_consilium.sh" \
    2>/dev/null \
    | grep -v "9-vendor + 5 reserved" || true)
  if [ -n "$HITS" ]; then
    echo "VIOLATION: stale vendor count in active content:"
    echo "$HITS"
    EXIT=1
    RULE2_HIT=1
  fi
done
[ $RULE2_HIT -eq 0 ] && echo "  ✓ Vendor count consistent (9-vendor canonical)"

# Rule 3: Zenodo DOI v3 cited in README
echo "=== Rule 3: Zenodo DOI v3 citation ==="
if grep -q "10.5281/zenodo.20277875" "$REPO_ROOT/README.md" 2>/dev/null; then
  echo "  ✓ Zenodo v3 DOI (10.5281/zenodo.20277875) cited in README"
else
  echo "  ⚠ Zenodo v3 DOI not cited in README — non-blocking, advisory"
fi

if [ $EXIT -eq 0 ]; then
  echo "=== ALL HONESTY CI RULES PASS ==="
else
  echo "=== HONESTY CI FAILED — fix violations before commit ==="
fi
exit $EXIT
