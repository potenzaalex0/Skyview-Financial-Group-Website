#!/usr/bin/env bash
# check-footers.sh - fail if any page's footer differs from the reference copy.
#
# The site has no shared template partial: every page carries its own footer
# markup. _partials/footer.html is the single source of truth (reference copy
# only - it is never rendered, never fetched, and is excluded from deployment
# by .vercelignore). This check is what stops the variants coming back.
#
# Byte-identical is the standard. Whitespace differences are failures, not
# noise: that is how the nine variants accumulated in the first place.
#
# Usage:   scripts/check-footers.sh
# Exit:    0 = every page matches (allowlisted pages excluded)
#          1 = at least one page diverged
set -uo pipefail
cd "$(dirname "$0")/.."

REF="_partials/footer.html"
[ -f "$REF" ] || { echo "ERROR: $REF not found"; exit 1; }

# Pages whose footer legitimately differs. Keep this list as short as possible
# and state the reason for every entry.
#   nua.html - carries an .article-tax-disclosure block inside its <footer>,
#              including a calculator-specific disclaimer that exists nowhere
#              else on the site. Its .footer-disclosure block and nav links
#              match the reference; the extra block is intentional.
#
#              THIS ENTRY IS THE CORRECT PERMANENT END STATE, NOT UNFINISHED
#              WORK. nua.html is a calculator, and its second disclosure
#              paragraph governs the calculator specifically, so it belongs
#              directly beneath the tool it governs - which is why it sits
#              INSIDE <footer class="site-footer"> rather than above it.
#              Articles use the opposite pattern: see
#              blog/asset-location-strategy.html, which carries its
#              .article-tax-disclosure above the footer, in the article body.
#              Two patterns for two different things is not drift.
#
#              Do not "normalise" this by moving the block. Moving approved
#              disclosure markup is exactly the operation that loses a
#              paragraph, and the only thing gained is one fewer line here.
#              Reviewed and decided 2026-09-22; deliberately not escalated to
#              the CCO, because no approved copy changes either way.
ALLOWLIST="nua.html"

# Extract from the reference the same way as from a page, so a trailing
# newline in the reference file is not itself reported as drift.
ref_block="$(sed -n '/<footer class="site-footer">/,/<\/footer>/p' "$REF")"
ref_hash="$(printf '%s' "$ref_block" | md5sum | cut -d' ' -f1)"
fail=0
checked=0

for f in $(git ls-files '*.html'); do
  case " $ALLOWLIST " in *" $f "*) echo "SKIP  $f (allowlisted)"; continue ;; esac
  [ "$f" = "$REF" ] && continue
  block="$(sed -n '/<footer class="site-footer">/,/<\/footer>/p' "$f")"
  if [ -z "$block" ]; then
    echo "NO FOOTER  $f"
    continue
  fi
  checked=$((checked+1))
  if [ "$(printf '%s' "$block" | md5sum | cut -d' ' -f1)" != "$ref_hash" ]; then
    echo "DRIFT $f"
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "OK: $checked page(s) match $REF"
else
  echo "FAIL: at least one footer diverged from $REF"
fi
exit "$fail"
