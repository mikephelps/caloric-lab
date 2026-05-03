# The Daily Foundation — Implementation Spec for Claude Code

## What This Is

A privacy-first, localStorage-only daily habit tracker page for CaloricLab. Users select habits from a library, complete them throughout the day, and watch a liquid-fill heart animate as they progress. The system cross-links to CaloricLab's existing calculators to personalize habit targets. No accounts, no backend, no data collection.

The goal is a daily-return page that drives repeat traffic and ad revenue through a sticky, rewarding UX.

---

## 1. SEO & Page Setup

### Metadata

| Field | Value |
|---|---|
| URL slug | `/daily-habit-tracker/` |
| H1 | The Daily Foundation |
| Meta title | Daily Habit Tracker & Fitness Checklist \| CaloricLab |
| Meta description | A privacy-first, science-backed daily habit tracker. Stay consistent with your metabolic health goals using our foundation checklist. No accounts required. |
| Canonical | `https://caloriclab.com/daily-habit-tracker/` |

### Astro Page

Create `src/pages/daily-habit-tracker.astro`. Use the site's existing layout component for consistent nav/footer/meta. The tracker itself is a React island with `client:load`.

### File Structure

```
src/
  pages/
    daily-habit-tracker.astro
  components/
    daily-foundation/
      DailyFoundation.tsx         # Main orchestrator
      LiquidHeart.tsx             # Heart SVG, liquid, rings, glow
      CarbonationBurst.tsx        # Canvas particle burst at 100%
      HabitGrid.tsx               # Browse view: filters + pills + custom input
      QueuePanel.tsx              # Action view: queue + action bar
      CompletedStack.tsx          # Completed items with undo
      WhyThisWorks.tsx            # Rotating science card
      useDailyState.ts            # localStorage hook, reset logic, streak
```

---

## 2. Design Integration — Use What Exists

### Critical: Pull From the Codebase, Don't Invent

Before writing any component styles, read the site's global CSS (the file containing `@theme`, `:root` tokens, and `@font-face` declarations). Every design decision below references values that already exist in the codebase.

### Fonts

The site uses two self-hosted font families. Do NOT import Google Fonts.

- **Headlines, H1, counter text inside heart, section labels:** `font-family: var(--font-display)` — this is Cabinet Grotesk. Use weight 700 or 800 for the H1 and heart counter, 500 for section labels.
- **Body text, habit labels, buttons, helper text:** `font-family: var(--font-sans)` — this is Satoshi. Use weight 400 for body, 500 for labels, 700 for button text.
- **Heading styles** already apply `font-family: var(--font-display)`, `font-weight: 700`, `line-height: 1.2`, `letter-spacing: -0.02em` via the base layer. Don't override these — use semantic heading tags.

### Dark Background

This page is full dark mode. Use the existing dark surface tokens:

- **Page background:** `--cl-dark-nav` which is `oklch(10% 0.02 220)` — a near-black with a subtle cool-blue undertone. This matches the site's dark nav and hero sections.
- **Card/surface elements** (queue items, settings panel, Why This Works card): `--cl-dark-card` which is `oklch(13% 0.025 220)` — slightly lighter than the page bg.
- **Glass effect for habit pills and queue items:** The site already defines `--glass-bg`, `--glass-border`, and `--glass-shadow`. Use these for the interactive cards on this page to maintain visual consistency with the rest of the dark UI.

### Accent Colors — Category Mapping

The site uses three accent colors on dark backgrounds. These appear in the CSS as the `.pill` color sequence and in the flyout nav. **Read the actual hex/oklch values from the nav component and the `.pill` rules in the global CSS.**

The known values from CSS:

| Role | CSS value | Usage on this page |
|---|---|---|
| Teal/cyan | `#22d3ee` (from `.pill` rule) | Hydration category accent |
| Lavender | `oklch(72% 0.18 292)` (from `.pill + .pill`) | Recovery category accent |
| Orange | `#f97316` (from `.pill + .pill + .pill`) | Nutrition category accent |

**Check the flyout nav component for potentially updated teal and orange values.** If newer values exist there, use those instead of the `.pill` values above.

Category color assignments:

| Category | Color source |
|---|---|
| Nutrition | Orange accent from nav/pills |
| Hydration | Teal/cyan accent from nav/pills |
| Movement | A warm amber — try `#f59e0b` (amber-500) or pull from any existing amber usage on the site |
| Recovery | Lavender/violet from pills — `oklch(72% 0.18 292)` |
| Metabolic | Site violet light — `var(--cl-violet-light)` or a warm coral |
| Custom | A muted rose in the heart's red family — `#c4737e` |

These colors are used for: the thin accent bar on each queue item (4px vertical bar), the category dot on browse-view pills (6px circle), and the active state on category filter tabs.

### The Heart's Color (Independent of Brand Accents)

The heart uses its own deep red palette, not the brand violet or teal. These values are specific to this feature:

- Base gradient: `#7a1616` → `#a82828` → `#bf3030`
- Light variant (wave layer): `#8a1e1e` → `#c43535` → `#d44040`
- Dark variant (wave layer): `#5e1010` → `#7a1a1a` → `#922222`
- Completed pill backgrounds: `rgba(145, 28, 28, 0.14)` with border `rgba(165, 38, 38, 0.22)`
- Ring strokes: `rgba(190, 60, 60, opacity)` where opacity fades across rings

### Text Hierarchy on Dark

| Level | Opacity | Usage |
|---|---|---|
| High emphasis | `rgba(255,255,255,0.88)` | Habit labels, H1, heart counter, completed pill labels |
| Medium emphasis | `rgba(255,255,255,0.60)` | Settings panel labels |
| Low emphasis | `rgba(255,255,255,0.35)` | "tap to complete", "Personalize", "undo" labels |
| Subtle/section | `rgba(255,255,255,0.18)` | "COMPLETED", "TODAY'S QUEUE" uppercase labels |
| Disabled | `rgba(255,255,255,0.15)` | Greyed-out pills in browse view |

**WCAG AA compliance:** Verify all text/background combinations pass AA. The low-emphasis text at 0.35 opacity on `oklch(10% 0.02 220)` needs to be checked — if it fails, bump to 0.40. Run these checks during implementation.

### Animations

Use Framer Motion for physics-based interactions where the site already has it installed. If not, CSS animations are fine — the site already uses `cubic-bezier(0.16, 1, 0.3, 1)` as its easing curve (visible in `--animate-fade-up` and button transitions). Use this same easing for consistency.

The `btn-calc` / `btn-primary` hover/active patterns (shadow + scale) should be referenced for any buttons on this page.

---

## 3. The Heart — Full Animation Spec

### SVG Structure

ViewBox: `-35 -35 350 330`. Heart path:

```
M140 250 C140 250 15 175 15 85 C15 35 55 5 95 5 C115 5 132 18 140 32 C148 18 165 5 185 5 C225 5 265 35 265 85 C265 175 140 250 140 250Z
```

Wide, round lobes. Deep center dip. Full bottom point.

### Concentric Rings

3 rings using the same heart path at scales 1.0x, 1.05x, 1.1x. Stroke color `rgba(190,60,60,opacity)`. Opacity fades: inner = `ringBase`, middle = `ringBase * 0.5`, outer = `ringBase * 0.2`. `ringBase` = `0.08 + intensity * 0.12` where intensity = fillPercent / 100.

### Liquid Fill — Multi-Wave System

4 wave layers inside a `<clipPath>` of the heart, plus a bobbing base rect.

| Layer | Direction | Amplitude | Speed | Gradient | Appears at | Opacity |
|---|---|---|---|---|---|---|
| Base rect | vertical bob | `3 + intensity * 5` px | `3.5 - intensity * 1.5` s | `lq` (base) | always | 1.0 |
| Wave 1 | right | `4 + intensity * 10` px | `4 - intensity * 2` s | `lqLight` | >0% | `0.35 + intensity * 0.2` |
| Wave 2 | left | `ampBase * 0.7` | `5 - intensity * 2.5` s | `lqDark` | >0% | `0.3 + intensity * 0.25` |
| Wave 3 | right (offset) | `ampBase * 0.45` | `3.5 - intensity * 1.5` s | `lqLight` | >20% | `0.12 + intensity * 0.15` |
| Wave 4 | right (slow) | `ampBase * 0.35` | `speed1 * 1.3` s | `lqDark` | >50% | `0.1 + intensity * 0.12` |

Key behavior: wave amplitude, speed, and layer count all increase with fill percentage. At low fill, gentle surface ripples. At high fill, visible churning. At 100%, waves continue with reduced amplitude (3px) and slower speed — the full heart stays alive.

### Counter Text

"X of X" at `x=140, y=115`. `dominant-baseline: central`, `text-anchor: middle`. Font: Cabinet Grotesk (via `var(--font-display)`), 26px, weight 700. Color transitions from dim (`rgba(255,170,170,0.35)`) to bright (`rgba(255,255,255,0.88)`) as fill crosses ~42%.

### Glow & Pulse

| State | Glow radius | Glow opacity | Pulse speed | Scale |
|---|---|---|---|---|
| Empty (0%) | 8px | 0.10 | 2.6s | 1.0 → 1.015 |
| Full (100%) | 36px + 72px dual | 0.70 + 0.30 | 1.8s | 1.0 → 1.03 |

Linear interpolation between these extremes based on fill percentage.

### Carbonation Burst (100% Celebration)

Triggers once when fill transitions from <100% to 100%. Canvas overlay, `pointer-events: none`.

- 4 spawn waves (30 orbs each) at 0ms, 250ms, 550ms, 900ms
- Each orb: position inside heart bounds, radius 1.5-6px, upward velocity with sine-based horizontal wobble
- Hue range: 348-364 (red/crimson)
- Radial gradient per orb + 3x radius glow halo
- Decay: 0.005-0.012 per frame, orbs fade and shrink
- Auto-cleanup after 3.5s

---

## 4. Habit Library

28 built-in habits across 5 categories, plus up to 10 user-created custom habits.

### Data Structure

```typescript
interface Habit {
  id: string;                    // e.g. "n1", "h3", "c1698234567"
  label: string;                 // Display text
  category: Category;            // "Nutrition" | "Hydration" | "Movement" | "Recovery" | "Metabolic" | "Custom"
  calcKey?: string;              // localStorage key from a CaloricLab calculator
  dynamicLabel?: (val: string) => string;  // Personalized label using calc value
}
```

### Built-in Habits

**Nutrition (8):** Hit your protein target (calcKey: `cl_calc_protein`), 30g protein at breakfast, Hit your calorie target (calcKey: `cl_calc_calories`), Eat enough fiber, No late-night snacking, Eat a vegetable every meal, Drink a protein shake, Meal prep today.

**Hydration (4):** Hit your water target (calcKey: `cl_calc_water`), Water before coffee, No sugary drinks, Electrolytes today.

**Movement (6):** 10,000 steps, 30-minute walk, Strength training, Stretch for 10 minutes, Take the stairs, Stand every hour.

**Recovery (6):** 8 hours of sleep, No screens 1hr before bed, Morning sunlight 10 min, Cold exposure, Meditate 5 minutes, Journal today.

**Metabolic (4):** Track your weight, Take your vitamins, Check in with hunger cues, No mindless eating.

### Calculator-Linked Habits

When a habit has a `calcKey`, the system checks localStorage for that key. If a value exists, `dynamicLabel(value)` replaces the generic label. Examples:

- `cl_calc_protein: "142"` → "Hit 142g protein" instead of "Hit your protein target"
- `cl_calc_calories: "2100"` → "Stay within 2100 cal"

If no value exists, the generic label displays with a "Personalize" helper link. **The existing calculators must write their results to these localStorage keys.** This is a small update to each calculator component — after computing a result, write `localStorage.setItem('cl_calc_protein', result)`.

---

## 5. State Management — `useDailyState.ts`

### localStorage Keys

| Key | Type | Persistence | Description |
|---|---|---|---|
| `cl_daily_queue` | `string[]` | Until user changes | Array of habit IDs in the active queue |
| `cl_daily_completed` | `{ date: string, items: string[] }` | Resets daily | Today's completed habit IDs + date stamp |
| `cl_daily_target` | `number` | Persistent | User's fulfillment target (default: 5, range: 1-15) |
| `cl_daily_streak` | `{ count: number, lastDate: string }` | Persistent, resets on miss | Consecutive days meeting target |
| `cl_daily_custom` | `Habit[]` | Persistent | User-created custom habits (max 10) |

### Daily Reset Logic (runs on mount)

```
1. Read cl_daily_completed from localStorage
2. If date !== today:
   a. Check if date === yesterday AND items.length >= target
      → If yes: increment streak, set lastDate to yesterday
      → If no: reset streak to 0
   b. Clear completed items (set to { date: today, items: [] })
3. Queue persists — user sees the same habits they selected
```

### "Start Over" Action

Clears both `cl_daily_queue` and `cl_daily_completed`. Returns user to empty heart + "Build Your Daily Queue" CTA. Does NOT clear target, streak, or custom habits.

### "Clear All My Data" Action (in settings)

Removes all `cl_daily_*` keys from localStorage. Page reloads to fresh state.

---

## 6. UI Views & Interactions

### Two Views

**Action view** (default when queue has items): Two-column grid on desktop. Left: heart + "You crushed it" banner (if 100%) + completed stack. Right: action bar + queue items. Single-column stack on mobile.

**Browse view** (for selecting habits): Category filter tabs, full habit pill grid, custom input field, "Add to Queue" button. Accessed via "+ Add more" button or "Build Your Daily Queue" CTA on empty state.

### Action Bar (Always Visible Above Queue)

Contains the section label ("Today's Queue" or "All Done") and two buttons side by side: "Start over" and "+ Add more". These are always visible regardless of queue or completion state.

### Completing a Habit

User taps a queue item → checkbox fills with checkmark → item fades left → item moves from queue array to completed array → heart liquid rises → completed pill appears in the stack below the heart.

### Undoing a Completion

User taps a completed pill → item moves from completed array back to queue array → heart liquid drops. The "undo" label is always visible on each completed pill (not hover-only, since mobile has no hover).

### "You Crushed It" Banner

Appears when fillPercent >= 100%. Positioned ABOVE the completed stack (between heart and completed items). Has a gentle opacity pulse animation. Contains a CTA to try a calculator for personalization.

### Completed Pills

Stacked vertically (not inline/wrapping — avoids layout jank). Each pill: mini heart icon (12px SVG), habit label text, "undo" text. Background matches heart red family. All pills pulse in sync with the heart's glow — pulse speed ties to fill percentage.

---

## 7. Cross-Linking to Calculators

### From Daily Foundation → Calculators (5 touchpoints)

1. **Habit pills with `calcKey` but no stored value:** Show "Personalize" text. Tapping it could link to the relevant calculator page.
2. **Queue items without personalization:** Inline text: "This is a default target. Use the Protein Calculator to get yours."
3. **"Why This Works" content cards:** Each snippet ends with a contextual link to the relevant calculator.
4. **100% completion CTA:** "Want to dial in your targets? Try a calculator" with links to unused calculators.
5. **Settings panel:** Section showing which calculators have been used and which haven't.

### From Calculators → Daily Foundation (1 touchpoint)

On each calculator's results page, add a CTA: "Track this daily on your Daily Foundation" linking to `/daily-habit-tracker/`. This closes the discovery → personalization → daily use loop.

### Calculator localStorage Integration

Each calculator needs a small addition: after computing results, write the key value:

```typescript
// Example in protein calculator result handler
localStorage.setItem('cl_calc_protein', calculatedProteinGrams.toString());
```

---

## 8. "Why This Works" Content

Rotating science card at the bottom of the page. Randomly selected on each visit. Provides crawlable SEO content and educational value.

4 snippets to start (expand over time):

1. **Protein & Muscle Synthesis** — "Distributing protein across meals maximizes muscle protein synthesis. Research shows 25-40g per meal is the sweet spot for most adults." Links to protein calculator.
2. **Morning Light & Circadian Rhythm** — "Exposure to bright light within 30-60 minutes of waking anchors your circadian clock, improving sleep quality and daytime alertness." No calculator link.
3. **Hydration & Cognition** — "Even mild dehydration (1-2% body weight loss) impairs concentration, mood, and working memory. Most people underestimate their needs." Links to hydration calculator.
4. **Habit Stacking** — "Linking new behaviors to existing routines dramatically increases adherence. Small wins compound over time into transformative change." No calculator link.

Consider adding more substantial evergreen content below this card for SEO depth — a few paragraphs about daily habit science, metabolic health foundations, etc. This gives Google crawlable content while the interactive tool above retains users.

---

## 9. Ad Placement Considerations

The page needs enough scroll depth and content zones for ad placements without feeling hostile. Potential slots:

- Between the tracker UI and "Why This Works" section
- Below "Why This Works" content
- Sidebar on desktop (if layout supports it)

These should use the same ad components/slots as the rest of the site. Don't build custom ad logic — just ensure the page structure has natural content breaks where ads can slot in.

---

## 10. Implementation Order

1. **`useDailyState.ts`** — Get the data layer working first. localStorage read/write, daily reset, streak logic. Test in isolation.
2. **HabitGrid + browse view** — Category tabs, pill grid, custom input, "Add to Queue" flow.
3. **QueuePanel + action view** — Queue items with completion interaction, action bar with "Start over" and "+ Add more".
4. **CompletedStack** — Completed pills with undo, vertical stack layout.
5. **LiquidHeart** — SVG heart, liquid fill, multi-wave system, rings, glow. This is the most complex component.
6. **CarbonationBurst** — Canvas particle effect, triggered by heart.
7. **WhyThisWorks** — Simple content card, random selection.
8. **Page assembly** — Astro page, layout integration, responsive grid, dark background.
9. **Calculator integration** — Add localStorage writes to existing calculators, add cross-link CTAs.
10. **WCAG audit** — Run contrast checks on all text/background combos. Fix any AA failures.

---

## 11. Reference Prototype

A working React prototype of this system exists as an artifact from the design phase. It demonstrates the heart animation, habit grid, queue flow, completion mechanics, and carbonation burst. The prototype uses placeholder fonts (Playfair Display, DM Sans) and colors — these must be replaced with the site's actual Cabinet Grotesk, Satoshi, and brand color tokens as specified above.

The prototype can be referenced for interaction patterns and animation timing, but all visual styling must be rebuilt using the site's existing design system.
