# Handoff: CaloricLab Hero Background — "Aurora · Rising Veil"

## Overview
A premium, animated **background layer** for CaloricLab hero sections, inspired by the
Aurora Borealis: soft drifting teal/violet/cyan colour bands across the top, with a
gentle gradient "veil" rising from the bottom edge. Two scales:

- **`full`** — the tall homepage hero
- **`compact`** — short interior page heroes (calculator pages, etc.)

> **Scope: background only.** This handoff intentionally contains **no hero content**
> (no headlines, buttons, breadcrumbs, etc.). The reference HTML shows placeholder
> content for context only — **do not port it.** Keep your current, live hero markup
> and styling exactly as-is; this background slots in *behind* it.

## About the Design Files
The files here are **design references created in HTML** — a prototype showing the
intended look and motion, not production code to copy wholesale. The deliverable for
implementation is the included **`HeroAuroraBg.astro`** component, which is written for
your stack (Astro + Tailwind) and is ready to drop in. The `.html` reference is only
for visually confirming the target result.

## Fidelity
**High-fidelity.** Exact colours, blur radii, opacities, sizes, and animation timings
are specified below and baked into the component.

## Target Stack
Astro + Tailwind CSS. The effect relies on radial/linear gradients, `filter: blur()`,
`mix-blend-mode: screen`, and `@keyframes` — none of which have clean Tailwind utility
equivalents — so it ships as a **scoped-`<style>` Astro component** rather than utility
classes. This keeps it self-contained and avoids polluting `tailwind.config`.

## How to Implement

1. Copy **`HeroAuroraBg.astro`** into your components directory
   (e.g. `src/components/HeroAuroraBg.astro`).

2. In each hero section, make the wrapper `relative` + `overflow-hidden` and give it the
   dark base colour, then render the background as the first child and your **existing**
   content as a sibling with `z-10`:

   ```astro
   ---
   import HeroAuroraBg from '../components/HeroAuroraBg.astro';
   ---
   <!-- Homepage hero -->
   <section class="relative overflow-hidden bg-[oklch(10%_0.02_220)]">
     <HeroAuroraBg variant="full" />
     <div class="relative z-10 mx-auto max-w-7xl px-6 py-20">
       <!-- KEEP your current hero content here, unchanged -->
     </div>
   </section>

   <!-- Interior page hero -->
   <section class="relative overflow-hidden bg-[oklch(10%_0.02_220)]">
     <HeroAuroraBg variant="compact" />
     <div class="relative z-10 mx-auto max-w-7xl px-6 py-8">
       <!-- KEEP your current breadcrumb / title / etc. here, unchanged -->
     </div>
   </section>
   ```

### Hard requirements on the wrapper (the only things you must add to existing markup)
- `position: relative` (Tailwind `relative`)
- `overflow: hidden` (Tailwind `overflow-hidden`) — bands extend past the edges and must be clipped
- a **dark** background colour so the `screen`-blended bands read (recommended `oklch(10% 0.02 220)`, the existing `--dark-nav`)
- content sibling at `z-index > 0` (Tailwind `relative z-10`)

No other content changes are required.

## Design Tokens

### Colours
| Role | Value |
|---|---|
| Wrapper base / dark-nav | `oklch(10% 0.02 220)` |
| Band — teal | `#0e7490` |
| Band — violet | `oklch(60% 0.22 292)` |
| Band — cyan | `#22d3ee` |
| Veil wash — teal stop | `rgba(14,116,144,.50)` |
| Veil wash — violet stop | `rgba(124,58,220,.24–.26)` |
| Veil bloom — violet | `oklch(52% 0.2 292)` |
| Base gradient (full) | `radial-gradient(120% 90% at 50% 0%, oklch(16% 0.04 250), oklch(9% 0.02 250) 55%, #060608)` |
| Base gradient (compact) | `radial-gradient(130% 150% at 50% 0%, oklch(15% 0.038 250), oklch(9.5% 0.022 250) 72%, #060608)` |

### Layer geometry

**`full` (homepage)**
| Layer | Size | Position | Blur | Opacity | Animation |
|---|---|---|---|---|---|
| Band b1 (teal) | 760×240 | left −8%, top 4% | 58px | .50 | aDrift1 17s |
| Band b2 (violet) | 680×220 | left 30%, top −8% | 58px | .50 | aDrift2 21s |
| Band b3 (cyan) | 560×180 | right −6%, top 0% | 58px | .50 | aDrift3 19s |
| Veil v1 (wash) | full width × 56% | bottom-anchored | — | .60 | (static) |
| Veil v2 (bloom) | 760×280 | centred, bottom −22% | 54px | .50 | aFloorGlow 20s |

**`compact` (interior)**
| Layer | Size | Position | Blur | Opacity | Animation |
|---|---|---|---|---|---|
| Band sb1 (teal) | 560×130 | left −6%, top −28% | 46px | .45 | aDrift1 18s |
| Band sb2 (violet) | 520×120 | left 34%, top −36% | 46px | .40 | aDrift2 22s |
| Band sb3 (cyan) | 420×100 | right −4%, top −22% | 46px | .32 | aDrift3 20s |
| Veil v1 (wash) | full width × 72% | bottom-anchored | — | .55 | (static) |
| Veil v2 (bloom) | 620×200 | centred, bottom −42% | 48px | .50 | aFloorGlow 20s |

### Texture
Film grain overlay: inline SVG `feTurbulence` (`baseFrequency 0.85`, `numOctaves 3`),
`opacity .045`, `mix-blend-mode: overlay`. Pure CSS, no asset.

### Motion
- `aDrift1/2/3`: slow translate (+ slight scaleX) loops, 17–22s, `ease-in-out`, infinite.
- `aFloorGlow`: the bottom bloom drifts sideways and breathes, 20s.
- All animations affect **only** `transform`/`opacity` (GPU-friendly).
- **`prefers-reduced-motion: reduce` freezes all motion** — already wired in the component.

## Performance Notes
Ship as **code, not an image.** This is < ~2KB gzipped, resolution-independent (no
retina banding), and the drift is free CSS motion (an image equivalent would need a
heavy video/Lottie). The only cost is GPU fill-rate from large `blur()` + `mix-blend-mode`
across animated layers; it's mitigated by animating transform/opacity only and the
reduced-motion off-switch. If low-end mobile ever shows jank, add a static fallback for
small screens via `@media` while keeping the live CSS on desktop.

## Files
- **`HeroAuroraBg.astro`** — the production component to implement (full + compact variants).
- **`CaloricLab Hero Backgrounds.html`** — visual reference prototype. The "A3 · Rising
  Veil — Page Heroes" section at the top shows both target results. *Content shown is
  placeholder — ignore it; implement the background only.*
