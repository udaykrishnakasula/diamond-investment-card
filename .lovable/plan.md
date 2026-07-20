## Goal

Create a single reusable, production-quality UI component `DiamondInvestmentCard` that renders a premium, interactive 3D "metal" investment card. UI-only, dummy data, no backend, no route changes.

## Deliverables

1. New file: `src/components/DiamondInvestmentCard.tsx`
   - Default export (or named export) React + TypeScript component.
   - Self-contained: all styling, dummy data, and animation logic live inside this one file.
   - No props required (accepts optional `className` for placement flexibility).
2. Install `framer-motion` via `bun add framer-motion` (not currently in the project).
3. No changes to existing routes, pages, or `src/routes/index.tsx`. The user explicitly said not to modify pages.

## Visual design

- Size: `w-[420px] h-[260px]` on desktop; responsive wrapper on mobile that scales down while keeping the 420:260 aspect ratio (`aspect-[42/26]`, `max-w-full`).
- Radius: `rounded-[24px]`.
- Metallic diamond-blue finish built from layered CSS:
  - Base: multi-stop linear + conic gradients in cool steel/blue tones.
  - Frosted glass overlay: `backdrop-blur` + translucent white layer.
  - Gloss reflection: diagonal white-to-transparent gradient with animated `x` translation (shine sweep).
  - Edge highlight: inner ring via `box-shadow: inset 0 0 0 1px rgba(255,255,255,.25)` and a subtle outer glow.
  - Noise texture: inline SVG `data:` background at low opacity for grain.
  - Premium drop shadow beneath the card that reacts to tilt.

## 3D scene & interaction

- Outer wrapper sets the 3D scene: `perspective: 1200px`, `transform-style: preserve-3d`.
- Inner motion element holds `rotateX` / `rotateY` motion values from `useMotionValue`, wrapped in `useSpring` for smoothness.
- Idle state: subtle floating loop via Framer Motion (`animate` on `y` and slight `rotateZ`) and a "breathing" glow (opacity oscillation on the outer glow layer).
- Pointer drag (mouse + touch via `onPointerDown/Move/Up`):
  - Track deltas; map horizontal delta → `rotateY`, vertical delta → `rotateX`.
  - Allow full 360° on both axes (no clamping).
  - On pointer release, spring back to default viewing angle (`rotateX: -8deg`, `rotateY: -12deg` for a premium tilt).
- Mouse parallax when not dragging: subtle rotation toward cursor position within the card bounds.
- Front/back sides are two absolutely-positioned children with `backface-visibility: hidden`; back is pre-rotated `rotateY(180deg)`. Full 360° rotation reveals the back naturally.
- Dynamic lighting: a radial-gradient highlight layer whose position is derived from current rotation values (via `useTransform`), so highlights shift as the card turns.
- Shine sweep: a separate absolutely-positioned diagonal gradient bar animated on an infinite loop with a long delay between passes.

## Content (dummy data, hardcoded)

Front:
- Header row: brand mark "◆ DIAMOND" + status pill "Active".
- Plan: Diamond
- Investment: $5,000
- Lock Period: 60 Days
- Return: 160%
- Small circular progress ring (SVG, 45%) with animated `strokeDashoffset` on mount.

Back:
- Investor Name: John Carter
- Investment ID: INV-2026-0001
- Start Date: 20 Jul 2026
- Maturity Date: 18 Sep 2026
- Expected Return: $8,000
- Status: Active

Both sides use the same metallic background layers to feel like one physical object.

## Motion details (Framer Motion)

- `useMotionValue` + `useSpring` (stiffness ~120, damping ~18) for `rotateX` / `rotateY`.
- Idle floating: `animate={{ y: [0, -6, 0] }}` with `duration: 6, repeat: Infinity, ease: 'easeInOut'`.
- Hover lift: `whileHover={{ scale: 1.02, y: -4 }}` on the outer wrapper.
- Shine sweep: separate `motion.div` with `animate={{ x: ['-120%', '220%'] }}`, `duration: 3.5`, `repeat: Infinity`, `repeatDelay: 2.5`.
- Breathing glow: outer glow layer animates opacity `[0.5, 0.8, 0.5]` on a slow loop.
- All transforms use `will-change: transform` for GPU acceleration.

## Technical notes

- TypeScript strict-safe: fully typed pointer handlers, no `any`.
- Tailwind v4 utilities only; complex gradients/backgrounds inlined via `style` prop where Tailwind can't express them.
- No new colors added to the theme — the card uses its own local palette via inline styles/gradients (it's a self-contained visual object, not a theme surface).
- No console errors, no external assets, no images.

## Out of scope

- No routes, no pages, no demo mounting.
- No API calls, no state persistence, no business logic.
- No changes to `__root.tsx`, `styles.css`, or theme tokens.

The component will be importable as:

```tsx
import { DiamondInvestmentCard } from "@/components/DiamondInvestmentCard";
```

for later use by the user when they choose where to display it.
