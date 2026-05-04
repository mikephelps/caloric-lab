# CaloricLab — Color Audit

Generated: May 2026

---

## Task 1 — Color Audit

### global.css Color Inventory

#### `@theme` block (Tailwind token definitions)

| Token | Value | Notes |
|-------|-------|-------|
| `--color-green-50` | `#ecfeff` | Remapped → cyan-50 |
| `--color-green-100` | `#cffafe` | Remapped → cyan-100 |
| `--color-green-200` | `#a5f3fc` | Remapped → cyan-200 |
| `--color-green-300` | `#67e8f9` | Remapped → cyan-300 |
| `--color-green-400` | `#22d3ee` | Remapped → cyan-400 — **main teal** |
| `--color-green-500` | `#06b6d4` | Remapped → cyan-500 |
| `--color-green-600` | `#0891b2` | Remapped → cyan-600 |
| `--color-green-700` | `#0e7490` | Remapped → cyan-700 |
| `--color-green-800` | `#155e75` | Remapped → cyan-800 |
| `--color-green-900` | `#164e63` | Remapped → cyan-900 |
| `--color-green-950` | `#083344` | Remapped → cyan-950 |
| `--color-violet` | `oklch(59% 0.24 292)` | Primary violet |
| `--color-violet-light` | `oklch(90% 0.10 292)` | Light violet |
| `--color-violet-subtle` | `oklch(96% 0.06 292)` | Near-white violet tint |
| `--color-violet-dark` | `oklch(42% 0.20 292)` | Dark violet |

#### `:root` block (CSS custom properties)

| Property | Value | Used For |
|----------|-------|----------|
| `--cl-violet` | `oklch(59% 0.24 292)` | Buttons, icons, borders, accents |
| `--cl-violet-light` | `oklch(90% 0.10 292)` | Footer hover, blog icons |
| `--cl-violet-subtle` | `oklch(96% 0.06 292)` | Tag backgrounds, callouts |
| `--cl-violet-dark` | `oklch(42% 0.20 292)` | Link text, active states |
| `--cl-violet-glow` | `rgba(120, 60, 220, 0.18)` | Referenced by name only |
| `--cl-dark-nav` | `oklch(10% 0.02 220)` | Header, hero bands, FAQ open state |
| `--cl-dark-card` | `oklch(13% 0.025 220)` | Why section, CTA section |
| `--cl-page-bg` | `oklch(96.5% 0.01 80)` | Body background (warm tan) |
| `--glass-bg` | `linear-gradient(... rgba(255,255,255,*))` | Glass card backgrounds |
| `--glass-border` | `1px solid rgba(255,255,255,.13)` | Glass card borders |
| `--glass-shadow` | Multiple rgba values | Glass card shadows |

#### Hardcoded values in global.css rules (not referencing variables)

| Line | Value | Used For |
|------|-------|----------|
| 127, 142 | `rgba(120, 60, 220, 0.3)` | `.btn-calc` / `.btn-primary` hover shadow |
| 157 | `#22d3ee` | `.pill` color (teal) |
| 158 | `oklch(72% 0.18 292)` | `.pill + .pill` color (mid-violet) |
| 159 | `#f97316` | `.pill + .pill + .pill` color (orange) |
| 163–165 | `rgba(120, 60, 220, 0/0.22/0)` | `resultsFlash` keyframe animation |

---

### Color Families — Summary Table

#### 🟣 Purples / Violets (new primary)

| Exact Value | File(s) | Line(s) | Used For | Count |
|-------------|---------|---------|----------|-------|
| `oklch(59% 0.24 292)` | global.css, CalculatorLayout.astro, index.astro, about.astro | Multiple | Violet primary token; aurora ellipse stroke | ~12 |
| `oklch(90% 0.10 292)` | global.css | 74, 82 | Violet light token | 2 |
| `oklch(96% 0.06 292)` | global.css | 75, 83 | Violet subtle token | 2 |
| `oklch(42% 0.20 292)` | global.css | 76, 84 | Violet dark token | 2 |
| `oklch(72% 0.18 292)` | global.css:158, Header.astro:45, QueuePanel.tsx:8 | 3 files | Pill mid-color, "Advanced Labs" nav label, Recovery habit category | 3 |
| `oklch(70% 0.18 292)` | index.astro:154 | 1 | Aurora ellipse (nearly same as 72% above — likely same intent) | 1 |
| `oklch(26% 0.24 292)` | CalculatorCallout.astro:17 | 1 | Dark violet callout background | 1 |
| `rgba(120, 60, 220, 0.18)` | global.css:85 | 1 | `--cl-violet-glow` definition | 1 |
| `rgba(120, 60, 220, 0.3)` | global.css:127, 142 | 2 | Button hover box-shadow | 2 |
| `rgba(120, 60, 220, 0/0.22/0)` | global.css:163–165 | 3 | `resultsFlash` animation keyframes | 3 |
| `rgba(134, 80, 252, 0.18)` | CalculatorCallout.astro:20 | 1 | Callout outer glow — **different purple from `--cl-violet-glow`** | 1 |
| `text-violet`, `bg-violet`, `border-violet`, etc. | Widespread | Many | Tailwind token usage (correct) | ~50+ |

#### 🩵 Teals / Cyans (brand — named "green" in code)

Note: all `green-*` Tailwind utilities are remapped to cyan values via `@theme`. The `teal-*` utility namespace is NOT remapped.

| Exact Value | File(s) | Used For | Count |
|-------------|---------|----------|-------|
| `#22d3ee` / `#22D3EE` | global.css, Header.astro, Footer.astro, index.astro, about.astro, blog/index.astro | Logo SVG, `.pill` color, aurora stroke, hero badge icon, nav "Most Popular" label | ~20 |
| `#62EAFF` | Header.astro, Footer.astro | Logo SVG water wave (lighter cyan) | 2 |
| `#0891b2` | global.css @theme, CalculatorLayout.astro, index.astro, about.astro, blog/index.astro | green-600 remap; aurora strokes | ~6 |
| `#0e7490` | global.css @theme, CalculatorLayout.astro, index.astro, about.astro, blog/index.astro | green-700 remap; aurora strokes | ~6 |
| `text-green-400` / `border-green-400` | All 9 TSX calculators | Input focus border, "Enter Your Details" icon — remapped to `#22d3ee` | ~20 |
| `text-green-500` / `bg-green-500` | TDEECalculator, WaterIntakeCalculator, BMRCalculator, MacroCalculator | Indicator bars, check icons — remapped to `#06b6d4` | ~8 |
| `text-green-600` / `bg-green-600` | MacroCalculator.tsx, blog/index.astro | Protein column header, link color, empty-state icon — remapped to `#0891b2` | ~4 |
| `text-green-700` / `bg-green-700` | All 9 TSX calculators | Result card header bg, active option text, action button bg — remapped to `#0e7490` | ~30 |
| `bg-green-50` | All 9 TSX calculators | Active option bg, section bg — remapped to `#ecfeff` | ~15 |
| `bg-green-100` | Many TSX files | Icon backgrounds, badge backgrounds — remapped to `#cffafe` | ~10 |
| `border-green-50/100/200/300` | Many TSX files | Container and input borders — all remapped | ~20 |
| `bg-green-800` | TDEE, Protein, BodyFat, IdealWeight, Water calculators | Button hover state — remapped to `#155e75` | ~5 |
| `focus:ring-green-500/25 focus:border-green-400` | All 9 TSX calculators | Input focus ring | ~9 |
| `bg-[#F9FFFF]` | GlassHero.astro, 7 TSX calculators | Very light cyan-tinted result section background | ~8 |
| `from-green-50 to-teal-50` | blog/index.astro:110 | Empty-state placeholder gradient — **OLD DESIGN / UNMAPPED** | 1 |
| `text-green-200` | blog/index.astro:111 | Empty-state book icon — **OLD DESIGN** | 1 |

#### 🟠 Oranges / Ambers

| Exact Value | File(s) | Used For | Count |
|-------------|---------|----------|-------|
| `#f97316` | global.css:159, Header.astro:46, MacroCalculator.tsx:94, QueuePanel.tsx:5 | `.pill` 3rd color, "Daily Metrics" nav label, Fat chart arc, Nutrition habit category | 4 |
| `text-orange-500` / `bg-orange-500` | MacroCalculator.tsx | Fat column header, macro dot, table cells | ~6 |
| `text-orange-700` / `bg-orange-50` / `border-orange-100` | MacroCalculator.tsx | Fat macro card | 3 |
| `bg-orange-400` | TDEECalculator.tsx:499 | Caloric surplus breakdown indicator dot | 1 |
| `text-orange-600` / `bg-orange-50` / `border-orange-200` | BMICalculator.tsx:14 | Obese I BMI category | 3 |
| `#f59e0b` | QueuePanel.tsx:7 | Movement habit category (amber-400) | 1 |
| `text-yellow-700` / `bg-yellow-50` / `border-yellow-200` | BMICalculator.tsx:13, BodyFatCalculator.tsx:10,18 | Overweight + Average body fat category | ~6 |
| `rgba(255, 165, 80, 0.85)` | DailyFoundation.tsx:149 | Streak warning text (amber-ish on dark) | 1 |

#### ⬛ Grays / Neutrals

All standard Tailwind `gray-*` utilities. No hardcoded hex gray values found outside logo SVGs. Used correctly throughout.

| Tailwind Class | Primary Use |
|---------------|-------------|
| `gray-900` | Headings, primary text |
| `gray-700` | Secondary text |
| `gray-600` | Body text, descriptions |
| `gray-500` | Muted text, dates, placeholders |
| `gray-400` | Disabled states, metadata |
| `gray-300` | Placeholder text, inactive icons |
| `gray-200` | Input borders, card borders |
| `gray-100` | Dividers, alternate row backgrounds |
| `gray-50` | Hover backgrounds |
| `gray-950` | Footer background, result card dark header |
| `gray-800/50` | Bottom bar border |

#### 🔵 Blues

| Exact Value | File(s) | Line(s) | Used For | Count |
|-------------|---------|---------|----------|-------|
| `text-blue-600` / `bg-blue-50` / `border-blue-200` | BMICalculator.tsx | 11 | Underweight BMI category | 3 |
| `text-blue-700` / `bg-blue-50` | BodyFatCalculator.tsx | 7, 15 | Essential Fat body fat category | 2 |
| `bg-blue-50` / `border-blue-100` / `text-blue-500/800/700` | DietBreakCalculator.astro | 553–559 | Info callout box ("What to Expect on the Scale") | 5 |
| `bg-blue-400` | TDEECalculator.tsx | 487 | Caloric deficit breakdown indicator dot | 1 |
| `#195C99` | Header.astro:76, Footer.astro:47 | 2 files | Logo SVG gradient stop (dark blue) | 2 |
| `"#0ea5e9"` | MacroCalculator.tsx | 93 | Carbs arc SVG fill (= sky-500) | 1 |
| `bg-sky-500` / `text-sky-500/700` / `bg-sky-50` / `border-sky-100` | MacroCalculator.tsx | 334 | Carbs macro result card | ~5 |

#### 🔴 Reds

| Exact Value | File(s) | Used For | Count |
|-------------|---------|----------|-------|
| `border-red-300 bg-red-50/40` | All 9 TSX calculators, DietBreakCalculator.astro | Input validation error state | ~10 |
| `text-red-600` / `bg-red-50` / `border-red-200` | BMICalculator.tsx, BodyFatCalculator.tsx | Obese II + Obese body fat categories | ~6 |
| `text-red-700` / `bg-red-100` / `border-red-300` | BMICalculator.tsx:16 | Obese III BMI category | 3 |
| `rgba(220, 80, 80, 0.85)` | QueuePanel.tsx:132 | Habit delete button hover color | 1 |
| `rgba(145, 28, 28, 0.42)` | DailyFoundation.tsx:113 | Error input border (dark UI) | 1 |
| `rgba(160,40,40,0.65)` / `rgba(200,70,70,0.90)` | WhyThisWorks.tsx:65,68 | Link colors on dark background | 2 |
| `rgba(190,80,80,0.72)` / `rgba(210,90,90,0.92)` | DailyFoundation.tsx:224,227 | Reset/danger button colors | 2 |
| `rgba(255,195,195,0.85)` | CompletedStack.tsx:30 | Completed habit item text | 1 |
| `rgba(255,175,175,0.90)` / `rgba(255,190,190,0.92)` / `rgba(255,180,180,0.92)` | HabitGrid.tsx, DailyFoundation.tsx | Various pink/red tones on dark habit UI | ~4 |
| `rgba(255,145,145,0.45)` | DailyFoundation.tsx:266 | Muted pink text on dark | 1 |
| `#7a1616` `#a82828` `#bf3030` `#8a1e1e` `#c43535` `#d44040` `#5e1010` `#7a1a1a` `#922222` | LiquidHeart.tsx:79–91 | SVG heart gradient animation (dark red tones) | 9 |

#### ❓ Unique / Miscellaneous

| Value | File | Line | Used For |
|-------|------|------|----------|
| `#20B7E9` | index.astro | 239 | "Most Popular" badge background — close to but different from `#22d3ee` |
| `#e07a5f` | QueuePanel.tsx | 9 | Metabolic habit category (coral/salmon) |
| `#c4737e` | QueuePanel.tsx, HabitGrid.tsx | 10, 141 | Custom habit category (pink/mauve) |
| `"#16a34a"` | MacroCalculator.tsx | 92 | Protein arc in donut chart — **actual green, not teal** |
| `#111827` | FaqAccordion.astro | 47 | FAQ question text (hardcoded = gray-900) |
| `#9ca3af` | FaqAccordion.astro | 52 | FAQ chevron (hardcoded = gray-400) |

---

### Files with Hardcoded Colors NOT Using CSS Variables or Theme Tokens

SVG logo hex values in Header/Footer are intentional asset use — excluded from this list.

| File | Hardcoded Values | Priority |
|------|-----------------|----------|
| `src/styles/global.css` | `rgba(120,60,220,*)` in button hover + animation; `#22d3ee`, `oklch(72%...)`, `#f97316` in pill rules | Medium |
| `src/components/Header.astro` | `"#22d3ee"`, `"oklch(72% 0.18 292)"`, `"#f97316"` in `columnColors` JS object | Medium |
| `src/layouts/CalculatorLayout.astro` | `#0e7490`, `oklch(59% 0.24 292)`, `#22d3ee`, `#0891b2` in aurora SVG inline | Low |
| `src/components/CalculatorCallout.astro` | `oklch(26% 0.24 292)`, `rgba(134,80,252,0.18)` in inline style | High |
| `src/components/FaqAccordion.astro` | `#111827`, `#9ca3af`, `#ffffff` in `<style>` block | High |
| `src/components/GlassHero.astro` | `bg-[#F9FFFF]` | Low |
| `src/pages/index.astro` | 5 aurora hex/oklch values; `#20B7E9` badge; `#22d3ee` icon | Medium |
| `src/pages/about/index.astro` | 4 aurora hex/oklch values | Low |
| `src/pages/blog/index.astro` | 4 aurora hex/oklch values; `from-green-50 to-teal-50`, `text-green-200`, `text-green-600` (old design) | **High** |
| `src/components/TDEECalculator.tsx` | `bg-[#F9FFFF]`; `bg-blue-400`, `bg-green-500`, `bg-orange-400`; all `bg/text/border-green-*` | High |
| `src/components/BMRCalculator.tsx` | `bg-[#F9FFFF]`; all `bg/text/border-green-*` | High |
| `src/components/CalorieDeficitCalculator.tsx` | `bg-[#F9FFFF]`, `border-green-50`; all `bg/text/border-green-*` | High |
| `src/components/MacroCalculator.tsx` | `bg-[#F9FFFF]`; `"#16a34a"`, `"#0ea5e9"`, `"#f97316"`, `"#f3f4f6"`, `"#111827"`, `"#9ca3af"` in SVG; all `bg/text/border-green-*` + `sky-*` + `orange-*` | **High** |
| `src/components/ProteinCalculator.tsx` | `bg-[#F9FFFF]`; all `bg/text/border-green-*` | High |
| `src/components/BodyFatCalculator.tsx` | all `bg/text/border-green-*` + `blue-*` + `yellow-*` + `red-*` | High |
| `src/components/WaterIntakeCalculator.tsx` | `bg-[#F9FFFF]`; all `bg/text/border-green-*` | High |
| `src/components/IdealWeightCalculator.tsx` | `bg-[#F9FFFF]`; all `bg/text/border-green-*` | High |
| `src/components/BMICalculator.tsx` | all `bg/text/border-green/blue/yellow/orange/red-*` (semantic health categories) | Medium |
| `src/components/DietBreakCalculator.astro` | `bg/border/text-blue-*` info callout | Medium |
| `src/components/daily-foundation/QueuePanel.tsx` | 6 hex category color values | Low (feature palette) |
| `src/components/daily-foundation/LiquidHeart.tsx` | 9 hex gradient values | Low (SVG animation) |
| `src/components/daily-foundation/DailyFoundation.tsx` | ~15 rgba values in inline styles | Low (dark UI) |
| `src/components/daily-foundation/HabitGrid.tsx` | ~10 rgba values | Low (dark UI) |
| `src/components/daily-foundation/CompletedStack.tsx` | 2 rgba values | Low |
| `src/components/daily-foundation/WhyThisWorks.tsx` | 4 rgba values | Low |

**Total: ~25 files with hardcoded colors** (daily-foundation components use a self-contained dark UI palette and can be treated separately).

---

## Task 2 — Cleanup Plan

### 1. Proposed CSS Custom Properties

Add to the `:root` block in `src/styles/global.css`, supplementing the existing `--cl-*` tokens:

```css
:root {
  /* ── Existing (keep as-is) ── */
  --cl-violet:        oklch(59% 0.24 292);
  --cl-violet-light:  oklch(90% 0.10 292);
  --cl-violet-subtle: oklch(96% 0.06 292);
  --cl-violet-dark:   oklch(42% 0.20 292);
  --cl-violet-glow:   rgba(120, 60, 220, 0.18);
  --cl-dark-nav:      oklch(10% 0.02 220);
  --cl-dark-card:     oklch(13% 0.025 220);
  --cl-page-bg:       oklch(96.5% 0.01 80);

  /* ── New: violet mid-tone (currently duplicated as oklch(72%) and oklch(70%)) ── */
  --cl-violet-mid:    oklch(72% 0.18 292);   /* nav column labels, pill 2nd, Recovery category */

  /* ── New: brand teal shades (aurora ellipses, logo, badges) ── */
  --cl-teal:          #22d3ee;               /* = green-400 remap — main cyan accent */
  --cl-teal-mid:      #0891b2;               /* = green-600 remap */
  --cl-teal-dark:     #0e7490;               /* = green-700 remap */
  --cl-teal-light:    #62EAFF;               /* logo wave highlight */

  /* ── New: accent orange ── */
  --cl-orange:        #f97316;               /* pill 3rd, Fat macro, Nutrition habit, Daily Metrics label */

  /* ── New: result section background ── */
  --cl-result-bg:     #F9FFFF;               /* light cyan-tinted white used in calculator result sections */

  /* ── New: callout component ── */
  --cl-callout-bg:    oklch(26% 0.24 292);   /* CalculatorCallout dark violet background */
  --cl-callout-glow:  rgba(134, 80, 252, 0.18); /* CalculatorCallout outer glow (consolidate with --cl-violet-glow) */

  /* ── Semantic status colors (BMI/BodyFat category indicators) ── */
  --color-success:    #0e7490;               /* "Normal" BMI, "Athletes" body fat (currently bg-green-700) */
  --color-warning:    #b45309;               /* "Overweight" category (yellow-700) */
  --color-error:      #dc2626;               /* "Obese" categories (red-600) */
  --color-info:       #1d4ed8;               /* "Underweight" + info callouts (blue-700) */
}
```

### 2. Corresponding Tailwind `@theme` Extension

```css
@theme {
  /* ── Keep all existing green→cyan remaps ── */

  /* ── New: expose teal as named utilities ── */
  --color-teal-brand: #22d3ee;      /* enables bg-teal-brand, text-teal-brand */
  --color-teal-mid:   #0891b2;      /* enables bg-teal-mid, text-teal-mid */
  --color-teal-dark:  #0e7490;      /* enables bg-teal-dark, text-teal-dark */

  /* ── New: violet mid-tone ── */
  --color-violet-mid: oklch(72% 0.18 292);   /* enables text-violet-mid for nav labels */

  /* ── New: result background ── */
  --color-result-bg:  #F9FFFF;      /* enables bg-result-bg in calculator components */

  /* ── New: callout background ── */
  --color-callout:    oklch(26% 0.24 292);   /* enables bg-callout in CalculatorCallout */
}
```

This lets the 9 TSX calculators switch `bg-[#F9FFFF]` → `bg-result-bg` and the callout switch its inline oklch value → `bg-callout`.

### 3. Files Needing Updates — Count

| Category | File Count | Scope |
|----------|-----------|-------|
| TSX calculator components (systematic green-* → token swap) | 9 | Large but identical pattern across all 9 |
| Astro pages with aurora SVG hardcoded hex values | 4 (index, about, blog/index, CalculatorLayout) | Small — 4 hex values per file → CSS vars |
| `Header.astro` `columnColors` JS object | 1 | Tiny — 3 values → CSS vars |
| `CalculatorCallout.astro` inline dark violet | 1 | Tiny |
| `FaqAccordion.astro` `<style>` block | 1 | Tiny — 3 hex → Tailwind gray tokens |
| `global.css` raw rgba in button/animation rules | 1 | Tiny — reference `--cl-violet-glow` |
| `MacroCalculator.tsx` SVG chart hardcoded hex | 1 | Medium — 6 chart color values |
| **Total** | **~18 files** | daily-foundation excluded (self-contained dark UI palette) |

### 4. Flagged Colors — Old Design / Inconsistencies

These should be reviewed and decided on before executing the cleanup:

| Value | File | Line | Issue |
|-------|------|------|-------|
| `from-green-50 to-teal-50` + `text-green-200` | `blog/index.astro` | 110–111 | `teal-*` is **NOT remapped** in `@theme` — uses default Tailwind teal (#f0fdfa for teal-50), not the brand cyan. Only place in the codebase where unmapped `teal-*` appears. Leftover visible in the no-hero-image empty state placeholder. |
| `text-green-600` (empty state icon) | `blog/index.astro` | 73 | Renders actual cyan-600 (`#0891b2`) for a book icon in the zero-articles state. Should be `text-violet` or `text-teal-brand`. |
| `"#16a34a"` in MacroCalculator chart | `MacroCalculator.tsx` | 92 | **Protein arc in the donut chart uses actual green-600 (`#16a34a`), not brand teal.** This is the only place an un-remapped green appears in a user-visible, interactive chart. Should be `#0e7490` (teal-dark) or `var(--cl-violet)` to match the brand. |
| `#20B7E9` badge bg | `index.astro` | 239 | "Most Popular" badge uses `#20B7E9` — visually close to `#22d3ee` but a different hex. Should be `var(--cl-teal)`. |
| `rgba(120,60,220)` vs `rgba(134,80,252)` | global.css vs CalculatorCallout.astro | — | Two different raw purple rgba values used as "violet glow" in different components. `--cl-violet-glow` exists (`rgba(120,60,220,0.18)`) but `CalculatorCallout` bypasses it with `rgba(134,80,252,0.18)`. Should unify under one variable. |
| `oklch(70% 0.18 292)` vs `oklch(72% 0.18 292)` | index.astro:154 vs global.css:158 | — | Two nearly identical violet mid-tones used for aurora ellipse and pill color respectively. Should both reference `--cl-violet-mid`. |

---

## Summary

**Biggest win:** All 9 TSX calculator files share an identical color pattern — `bg-green-700` result headers, `bg-[#F9FFFF]` result backgrounds, `focus:ring-green-500/25` input rings. A single systematic find-and-replace pass across those 9 files eliminates ~130 hardcoded references and replaces them with consistent named tokens.

**Most urgent fix:** `blog/index.astro` lines 110–111 use `from-green-50 to-teal-50` with unmapped `teal-*` classes. This is the only file where default Tailwind teal colors appear, meaning those colors render differently from every other teal on the site.

**Existing system is solid:** The `--cl-*` CSS variable system and the `green-*`→cyan `@theme` remap are well-designed. The cleanup is largely additive — define ~8 new tokens (`--cl-teal`, `--cl-teal-dark`, `--cl-violet-mid`, `--cl-result-bg`, `--cl-callout-bg`, etc.) and then systematically swap the ~18 affected files to reference them.

**Daily Foundation components** use a self-contained dark UI with feature-specific category colors and rgba transparency values on dark backgrounds. These are intentional and consistent within the feature — low priority for the main color system cleanup.
