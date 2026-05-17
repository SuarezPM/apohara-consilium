# Apohara Typography Roadmap

## Current state (2026-05-17)

The frontend uses **stand-in fonts** (all OFL, self-hosted in `packages/frontend/public/fonts/`):

| Role | Brand-board name (aspirational) | Stand-in font | Source |
|---|---|---|---|
| Display / Title | Apohara Pixel Sans | **Press Start 2P** | Google Fonts (OFL) |
| Code / Mono | Apohara Mono Pixel | **JetBrains Mono** | jetbrains.com/lp/mono (OFL) |
| Body / Reading | (n/a — body should always be a sans-serif legibility font) | **Inter** | rsms.me/inter (OFL) |

Press Start 2P gets us 80% of the pixel-sans aesthetic and is the de-facto choice for 16-bit-style web typography. The remaining 20% (Apohara-specific letterforms, kerning, multilingual support) is a custom font project that doesn't fit in the hackathon window.

## Post-hackathon: build custom fonts

Three suggested tools, in order of effort vs polish:

1. **BitFontMaker2** (web-based, free, ~1 day)
   - https://www.pentacom.jp/pentacom/bitfontmaker2/
   - Direct pixel-grid editor, exports as TTF
   - Best for: getting a unique Apohara letterform in 24h without leaving the browser
   - Tradeoff: limited to one weight, no advanced typography features

2. **BMFont** + **FontForge** pipeline (~3-5 days)
   - https://www.angelcode.com/products/bmfont/ + https://fontforge.org/
   - Design pixel glyphs in BMFont, export, refine in FontForge, output as TTF/WOFF2
   - Best for: matching the exact pixel grid from the brand-board mascot logo (the "APOHARA" wordmark)
   - Tradeoff: 2-tool pipeline, FontForge has a learning curve

3. **Glyphs 3 / FontLab** (commercial, ~1-2 weeks for a complete family)
   - https://glyphsapp.com/ ($299) or https://www.fontlab.com/ ($499)
   - Industry-standard tools used by professional type designers
   - Best for: shipping `Apohara Pixel Sans Regular / Bold / Italic` as a complete typographic family
   - Tradeoff: cost + time

### Recommended path for v1

**Build "Apohara Pixel Sans Regular" only** (no bold, no italic) using BitFontMaker2 in ~1 day, post-hackathon. Use the letterforms from the existing brand-board logo as reference. Replace `Press Start 2P` substitution in `packages/frontend/src/index.css` `@font-face` declarations. Bold/italic + monospace variants can land in v2.

### Stretch: build "Apohara Mono Pixel" matching the brand-board's code font

The brand board specifies a custom monospace pixel font for code blocks and audit IDs. JetBrains Mono is the cleanest stand-in. To match the brand-board exactly:

1. Generate the mono variant in BitFontMaker2 with fixed-width glyphs (every char fits in same pixel box)
2. Include 0/O distinction (slashed-zero), 1/l/I distinction (serifed-1, dotless-l, top-serifed-I) — critical for legibility in code contexts
3. Export with full ASCII + common code symbols (=, <, >, ->, =>, etc.)

## What we should NOT chase

- **Variable axes / OpenType features**: pixel fonts don't benefit from these. Keep it simple.
- **Multilingual coverage beyond Latin-1**: until we have non-Spanish/English content, no point.
- **Cursive / handwritten variants**: off-brand for a technical product.
