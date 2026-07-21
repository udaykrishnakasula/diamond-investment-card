
## Goal

Elevate the **back side** of `DiamondInvestmentCard` from a plain data list into a proper "certificate" face that matches the diamond-fire luxury of the front, and add a couple of small front add-ons for cohesion. UI-only. No new files, no data changes, no route changes.

## Back side — redesign

Right now the back is: header row, five plain `Row`s, tiny footer. It reads like a receipt, not a diamond certificate. New layout, top → bottom:

1. **Certificate header band**
   - Left: monogram `◆ DIAMOND RESERVE` in the same gradient text style used on the front title.
   - Right: existing `StatusPill` (Active).
   - Thin hairline divider with a diamond-shaped centered notch (`◆`) instead of a plain border.

2. **Investor block (hero of the back)**
   - Small uppercase label: `Certificate Holder`.
   - Large gradient name: `John Carter` (same gradient recipe as the `$5,000` on front, one size down ~22px).
   - Under it, the Investment ID rendered as a **monospace serial** (`INV-2026-0001`) with letter-spacing, in a subtle framed pill (`border border-slate-900/15 bg-white/30 backdrop-blur-[2px]`), to feel like an engraved serial number.

3. **Timeline strip (replaces Start/Maturity rows)**
   - Horizontal 3-node timeline: `Start · 20 Jul 2026` ── active dot ── `Maturity · 18 Sep 2026`.
   - Connecting line is a subtle gradient (slate → icy blue → slate). A small pulsing dot sits ~45% along the line to mirror the front progress ring value visually.
   - Tiny labels above nodes (`START`, `MATURITY`) in the same uppercase tracking as front labels.

4. **Expected return highlight**
   - Right-aligned block: label `Expected Return` + gradient value `$8,000` (same gradient family as front).
   - Small caret-up glyph `▲` in muted emerald next to it (visual only).

5. **Certificate footer**
   - Left: faux signature script for `John Carter` (Tailwind `italic font-serif` with a hand-drawn feel; pure CSS, no font import — falls back to the system serif).
   - Right: seal — a small circular `◆` badge with a rotating conic-gradient ring (very slow, ~20s) to sell "authenticated." Reuse existing conic/prismatic layers scaled down; no new libs.
   - Under the signature: micro-text `Issued 20 Jul 2026 · Non-transferable` at ~9px slate-500.

6. **Back-side shine sweep**
   - Add the same shine sweep motion component the front has, but slower (5s / repeatDelay 4s) and lower opacity so it doesn't compete with the front.

## Front side — small add-ons (cohesion only)

- **Chip glyph** in the top-right of the header row (before the `StatusPill`): a tiny 24×18 rounded "chip" using the same conic-gradient recipe as the card body, with a 1px inner ring. Sells the "physical card" read.
- **Micro-serial** in the front footer's bottom-left corner (below Lock Period), 9px slate-500 mono: last 4 of the investment ID `··· 0001`. Visually ties front and back.
- Nothing else on the front changes.

## What stays the same

- Component API, props, exports, file location.
- Dummy data values, both faces present, drag-to-hold behavior, idle float, breathing glow, sparkles, prismatic fire, dynamic highlight.
- Overall size, aspect ratio, 24px radius, resting tilt.

## Out of scope

- No new dependencies, no fonts, no images/assets.
- No route/page changes, no theme token changes.
- No logic, no backend, no state beyond what's already there.

## Technical notes

- All new elements live inside the existing `<CardFace back>` block plus small additions in `<CardFace>` (front).
- Timeline: pure flex + 2 absolutely-positioned dots and a `linear-gradient` line; the moving progress dot uses `motion.span` with `animate={{ left: ['5%', '45%'] }}` on mount, then a subtle `opacity` pulse.
- Signature: `<span className="font-serif italic text-[18px] text-slate-800/80">John Carter</span>` with a thin underline `border-b border-slate-900/20`.
- Seal ring: `motion.div` with `backgroundImage: conic-gradient(...)` and `animate={{ rotate: 360 }}` at `duration: 20`, `repeat: Infinity`, `ease: "linear"`.
- Chip glyph: same conic-gradient stack shrunk to 24×18, `rounded-[4px]`, `boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)"`.
- Every new text color stays in the dark-slate family already used, so contrast is preserved on the diamond finish.
- TypeScript strict-safe, no `any`, no new hooks patterns.
