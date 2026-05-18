# Apohara Brand Asset Prompts — for nanobanana Pro / Veo3 / equivalent

Generated 2026-05-17 as part of Phase 5 handoff. The frontend currently uses placeholder SVGs (a lime pixel grid). Use these prompts to generate the real brand-aligned assets and drop into `packages/frontend/public/`.

**Brand constants** (paste at top of every prompt for consistency):

- Palette (must use these exact hex):
  - Electric Lime: `#16D63A` (primary accent, lights, eyes, headdress feathers)
  - Blue-Charcoal: `#2A2D3A` (background, base)
  - Bone-White: `#EDEFF0` (face highlights, ivory)
  - Neutral Black: `#0E1010` (outlines, deep shadow)
  - Crimson Red: `#B8262A` (use sparingly — Aegis variant only)
- Style: **pixel art**, 16-bit aesthetic, hand-drawn pixel-perfect feel
- Subject: **Native American chief mascot**, 3/4 profile facing left, feathered war headdress, stoic expression
- Render: NO gradients, NO blur, NO anti-aliasing. Sharp pixel edges. Square corners.
- Reference inspiration: classic 16-bit RPG character portraits, brand example: the Apohara brand board image already supplied

---

## 1. Mascot — Full color (1024×1024 PNG, transparent bg)

> Pixel art portrait of a Native American chief in 3/4 left-facing profile.
> Feathered war headdress with electric lime green (#16D63A) feather tips +
> bone-white (#EDEFF0) feather shafts, a single thin crimson red (#B8262A)
> band across the headdress middle. Face in bone-white with subtle warm
> tan undertones (#C8A87E). Strong neutral-black (#0E1010) pixel outlines,
> 1px stroke. Background: transparent. 16-bit aesthetic. No gradients, no
> anti-aliasing, sharp pixel edges. Square 1024×1024. Centered subject with
> ~80px padding on all sides.

**Save as**: `packages/frontend/public/mascot-color.png`

---

## 2. Mascot — Lime-only (Context Forge variant, 1024×1024 PNG, transparent bg)

> Same pixel art Native American chief portrait as the full-color version,
> but the feathered headdress is monochrome electric lime green (#16D63A)
> with bone-white (#EDEFF0) feather highlights — NO crimson red, NO warm
> tones. Add 4-6 small disconnected lime-green pixel "tech circuit" squares
> floating to the right of the headdress, suggesting network nodes /
> data-plane motif. Face in bone-white. Black outlines 1px. Transparent
> background. Square 1024×1024.

**Save as**: `packages/frontend/public/mascot-contextforge.png`

---

## 3. Mascot — White outline only (1024×1024 SVG ideally, for PDFs and dark/light surfaces)

> Vector pixel art Native American chief portrait, OUTLINE-ONLY treatment.
> White (#FFFFFF) 2px strokes on transparent background. No fill colors.
> Same 3/4 left-facing pose + feathered headdress + face structure as the
> full-color version. Suitable for dropping onto either dark or light
> surfaces. Square 1024×1024.

**Save as**: `packages/frontend/public/mascot-outline.svg`
**Note**: SVG output preferred (scales without quality loss for paper PDFs); PNG acceptable if SVG export not available.

---

## 4. Favicon — 32×32 pixel grid (SVG)

Already shipped as placeholder (`packages/frontend/public/favicon.svg`) — a 3×3 lime pixel grid on dark navy. The full mascot is too detailed at 32px; the placeholder reads cleanly as a brand mark even at favicon size. **Recommend keeping the current favicon** OR generate this minimal variant:

> 32×32 SVG. Background: blue-charcoal #2A2D3A square (full 32×32). Foreground:
> a simplified pixel-art chief silhouette in electric lime #16D63A —
> just the headdress arc + abstract face suggested by 3-4 lime pixels.
> Must be readable as a brand mark at 16×16. Shape-rendering: crispEdges.

**Save as**: `packages/frontend/public/favicon-mascot.svg` (alongside the current placeholder; A/B test which reads better)

---

## 5. Open Graph image — Social sharing card (1200×630 PNG)

> 1200×630 social media share image. Background: blue-charcoal #2A2D3A
> solid. Subtle electric lime #16D63A grid pattern overlay at ~5% opacity
> (16×16px squares). Centered composition:
> - Left side (40%): full-color mascot pixel art (from Asset #1), scaled to ~400px tall, vertically centered
> - Right side (60%):
>   - "APOHARA PROBANT" in custom pixel-sans typeface (or Press Start 2P substitute), 60px height, bone-white #EDEFF0
>   - One-line tagline below in mono font (JetBrains Mono), 24px, lighter weight, muted-gray #8B90A8: "A different AI audits the code your AI just wrote."
>   - Three small chip badges below: "9 vendors" / "INV-15 isolation" / "Apache-2.0" — each in electric lime #16D63A border with mono text inside
> - Bottom right corner: small bone-white "apohara.dev" wordmark in mono font, 16px
> Sharp pixel rendering throughout. NO gradients, NO drop shadows.

**Save as**: `packages/frontend/public/og-image.png`

---

## 6. Per-repo banner cards (3 variants, 1280×400 PNG each — for GitHub social previews)

Three variants, each substituting the sub-brand color and subtitle:

### 6a. `apohara-inti` banner

> 1280×400 banner. Background: blue-charcoal #2A2D3A. Left 30%: full-color
> mascot (#16D63A lime headdress feathers, white feather shafts, crimson
> mid-band). Right 70%: "APOHARA" title in Press Start 2P, 96px, bone-white.
> Subtitle "INTI" below in 48px, electric lime #16D63A. Tagline at bottom:
> "Cross-AI Code Verifier" in JetBrains Mono 20px, muted gray.

**Save as**: `packages/frontend/public/banner-inti.png`

### 6b. `Apohara_Context_Forge` banner

> Same layout, but:
> - Mascot is the lime-only variant (Asset #2)
> - Subtitle: "CONTEXT FORGE" in electric lime #16D63A
> - Tagline: "Multi-Agent KV-Cache Registry + INV-15 Memory Isolation"

**Save as**: `packages/frontend/public/banner-contextforge.png`

### 6c. `apohara-aegis` banner

> Same layout, but:
> - Mascot is the full-color variant (red emphasis prominently — Asset #1)
> - Subtitle: "AEGIS" in crimson red #B8262A
> - Tagline: "9-Vendor Adversarial Ensemble for Code-Review Safety"

**Save as**: `packages/frontend/public/banner-aegis.png`

---

## 7. Hero terminal background pattern (1920×1080, optional)

If we want to replace the inline lime grid (currently inline-styled in `Hero.tsx`) with a real image:

> 1920×1080 wallpaper. Background: blue-charcoal #2A2D3A. Foreground: subtle
> electric lime #16D63A pixel grid — 16×16px cells with 1px lime lines at
> 8% opacity. Add 3-5 small pixel-art "data flow" motifs scattered in the
> lower third: tiny lime squares connected by lime pixel-trail lines,
> suggesting agent message passing. Negative space dominant. NO bright
> areas. Optimized for use as a section background behind text content.

**Save as**: `packages/frontend/public/hero-grid.png`

---

## Verification after generation

1. Drop all generated files into `packages/frontend/public/`
2. Update component references (search-replace `/favicon.svg` → relevant mascot path in `Navbar.tsx` + `Hero.tsx` + `Footer.tsx`)
3. Run `npm run build && vercel --prod` from `packages/frontend/`
4. Open https://www.apohara.dev — verify mascot renders sharply (no blurry upscaling — `image-rendering: pixelated` class should be applied)
5. Share https://www.apohara.dev URL on Twitter/LinkedIn → preview shows the new OG image

---

## Style cheat-sheet (paste into any AI image tool)

> pixel art, 16-bit, sharp edges, no anti-aliasing, no gradients, no blur,
> palette: #16D63A (lime), #2A2D3A (charcoal), #EDEFF0 (bone), #0E1010 (ink),
> #B8262A (crimson — use sparingly), shape-rendering: crispEdges
