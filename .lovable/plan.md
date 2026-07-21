## Goal

Make `DiamondInvestmentCard` actually look like a **diamond/crystal** — not a flat silver/white slab. The current finish is a smooth platinum gradient, which reads as "metal card." A real diamond feel needs faceted geometry, prismatic light dispersion, and glassy translucency.

Scope: visual/CSS-only changes inside `src/components/DiamondInvestmentCard.tsx`. No new files, no route changes, no logic changes. Keep dummy data, drag-to-hold behavior, and text color contrast.

## What changes

### 1. Crystalline faceted base (replace the smooth platinum body)
Replace the single soft platinum gradient with a **faceted diamond surface** built from stacked `conic-gradient` + `linear-gradient` layers that simulate cut facets:
- A `conic-gradient` from 8–12 pale color stops (icy white, pale cyan, pale violet, pale rose, pale mint, pale gold) rotated around ~50% 50% — creates the classic diamond "pinwheel of facets."
- A second offset `conic-gradient` at lower opacity for secondary facet edges.
- Two crossing `linear-gradient` stripes at ~30° and ~150° for cut-line highlights.
- Base tint stays cool white so text remains legible, but with much more color variation than today.

### 2. Prismatic rainbow dispersion (fire)
Add a dedicated overlay layer with a soft rainbow `linear-gradient` (red→orange→yellow→green→cyan→blue→violet) at low opacity (~15–20%) with `mix-blend-mode: color-dodge` or `screen`. This produces the "fire" that diamonds throw. Animate a slow horizontal drift (very slow, ~14s loop) so the rainbow shimmer moves as if catching light.

### 3. Sparkle points
Add 4–6 tiny absolutely-positioned white dots (2–3px, `box-shadow` glow, `mix-blend-mode: screen`) at fixed facet intersections, each with a staggered `opacity` + `scale` twinkle animation (Framer Motion, 2–4s loop, different delays). Subtle, not glittery/tacky.

### 4. Glassy edge & bevel
- Strengthen the inner ring: brighter top-left highlight, darker bottom-right shadow inside the card, to sell the beveled crystal edge.
- Slight increase in outer drop shadow saturation toward cool blue for a "resting on glass" look.

### 5. Cooler outer glow
Shift the breathing glow from neutral silver to a very pale icy-cyan/violet mix, so the halo around the card reads "gem" not "chrome."

### 6. Keep readability
Text stays dark slate (`#0f172a` / `#334155`). Add a very subtle white translucent plate (`bg-white/25 backdrop-blur-[2px]`) only behind the large `$5,000` number and the certificate rows if contrast drops after adding the prismatic layer — decided visually during implementation.

## What stays the same

- Component API, props, file location, exports.
- Framer Motion interactions: drag, hold-in-place (no snap-back), idle float, hover lift, shine sweep, breathing glow.
- Dummy data, both faces, progress ring, status pill.
- Overall size, aspect ratio, radius.

## Out of scope

- No images, no external assets.
- No new dependencies.
- No changes to routes, pages, theme tokens, or `styles.css`.
- No behavior/logic changes.

## Technical notes

- All new layers are CSS `background-image` stacks + a couple of extra `motion.div` overlays inside `CardFace` / the card body. No new components.
- Prismatic + facet layers sit **below** the noise grain and **below** the dynamic highlight, so lighting still shifts correctly during rotation.
- All animations use existing Framer Motion — no new libs.
- Sparkles are `motion.span` with `animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}` on staggered delays.
- TypeScript strict-safe, no `any`, no console errors expected.