## Goal

Turn the approved Diamond card into a typed, four-variant card system — Silver, Gold, Diamond, Platinum — rendered as four cards on the home page. Same physical card model, same 3D system, same animations, same layout. Only material, branding and plan data differ.

The Diamond card's appearance and behaviour stay byte-for-byte equivalent: its current gradients, shadows, glow, text colors, sparkles, prismatic layers, timings and easings become the `diamond` entry of the theme config, so it renders exactly as it does today.

## Refactor (minimal)

Rename the component to `InvestmentCard` in the same file, with a backwards-compatible `DiamondInvestmentCard` export that renders `variant="diamond"`.

```ts
type CardVariant = "silver" | "gold" | "diamond" | "platinum";
<InvestmentCard variant="gold" />
```

Everything currently hardcoded as a color/gradient string moves into a `CARD_THEMES: Record<CardVariant, CardTheme>` object. The theme covers: face background layers, inset bevel shadows, chip gradient, prismatic overlay, sparkle color, outer breathing glow, dynamic highlight tint, progress-ring gradient stops, title/amount/return gradient text, and the text-color family (ink vs. platinum-on-black). Structure, spacing, sizes, motion props and JSX stay identical for all four.

## Materials

- **Silver** — bright polished silver: icy white highlights, cool metallic grey mid-tones, blue-silver reflections, restrained prismatic fire. Dark-slate typography, as on Diamond.
- **Gold** — champagne/warm metallic gold with amber and soft bronze depth, bright gold specular highlights. Deep brown-bronze typography for contrast. No neon yellow.
- **Diamond** — unchanged.
- **Platinum** — deep black/graphite metal base with charcoal facets, restrained platinum-silver and icy-white highlights, cool platinum sheen. Typography inverts to silver/platinum tones (light text, subtle white borders, light-on-dark pills and rings) so the existing layout stays readable.

## Branding

| Variant | Front | Back certificate |
| --- | --- | --- |
| Silver | ◆ SILVER | ◆ SILVER RESERVE |
| Gold | ◆ GOLD | ◆ GOLD RESERVE |
| Diamond | ◆ DIAMOND | ◆ DIAMOND RESERVE |
| Platinum | ◆ PLATINUM | ◆ PLATINUM RESERVE |

## Data

Per-variant dummy data object, same fields as today.

| | Silver | Gold | Diamond | Platinum |
| --- | --- | --- | --- | --- |
| Investment | $300 | $1,000 | $5,000 (unchanged) | $5,000 |
| Return | 200% | 200% | 160% (unchanged) | 200% |
| Lock period | 60 Days | 60 Days | 60 Days | 60 Days |
| Investment ID | INV-2026-0002 | INV-2026-0003 | INV-2026-0001 | INV-2026-0004 |

Investor name, status, progress (45%), start 20 Jul 2026 / maturity 18 Sep 2026 carry over from the existing card; expected return is stated as the amount plus the return percentage. Micro-serial on each front shows the last 4 of that card's ID. Tell me if Silver/Gold should differ on return or lock period and I'll adjust — nothing is computed, all values are static display strings.

## Page layout

`src/routes/index.tsx` renders all four in order Silver → Gold → Diamond → Platinum on the existing dark radial background: a single column on mobile, two columns on tablet, and a four-across / two-by-two responsive grid on desktop. Each card keeps `max-w-[420px]` and its `42/26` aspect ratio, its own `perspective` wrapper and independent drag state, with enough gap for the glow and 3D tilt. No horizontal scroll, no stretching.

## Out of scope

No new dependencies, no carousel, no backend, no routing changes, no changes to the Diamond visual or interaction behaviour.

## Technical notes

- One file: `src/components/DiamondInvestmentCard.tsx` grows the theme map and variant prop; `src/routes/index.tsx` renders the grid and gets an updated head title/description.
- `CardFace`, `ProgressRing`, `StatusPill`, `DynamicHighlight` take the theme (or the colors they need) as props instead of hardcoded strings.
- The `ProgressRing` SVG gradient id is namespaced per variant so four rings on one page don't collide.
- Strict TypeScript, no `any`; theme objects typed against a `CardTheme` interface.
