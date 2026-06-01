# Food Log — Implementation Spec for Claude Code

## What This Is

A simple, privacy-first daily food journal for CaloricLab. Users log what they eat throughout the day organized by meal category. No calorie counting, no macro tracking, no nutrition lookups — just text entries that build awareness. All data stays in localStorage. No accounts, no backend.

This is the second feature under the "Daily Foundation" umbrella, alongside the Habit Tracker.

---

## 1. Navigation Restructure

### Change: "Daily Foundation" becomes a dropdown

The current nav has "Daily Foundation" as a single link to the habit tracker. This needs to become a dropdown menu (matching the style of the existing "Calculators" dropdown) with two items underneath:

| Nav item | Links to | Notes |
|---|---|---|
| **Daily Foundation** (parent) | Dropdown trigger, not a link | Dropdown label |
| Habit Tracker | `/daily-habit-tracker/` | **DO NOT change this URL. It is already live and indexed by search engines.** |
| Food Log | `/food-log/` | New page |

The dropdown should use the same component/pattern as the Calculators dropdown in the nav. Match the interaction, styling, and responsive behavior exactly.

### CRITICAL: Do not change the Habit Tracker URL

The Habit Tracker page must remain at `/daily-habit-tracker/`. Do not rename, redirect, or modify this URL. It is indexed by Google and has existing SEO equity. Only the nav label changes — from "Daily Foundation" (direct link) to a "Daily Foundation" dropdown with "Habit Tracker" as a sub-item pointing to the same URL.

### Habit Tracker H1 Update

On the habit tracker page itself, consider updating the H1 from "The Daily Foundation" to "Habit Tracker" for clarity and SEO alignment with the URL slug. The meta title can remain as-is or be updated to "Daily Habit Tracker & Fitness Checklist | CaloricLab" (it may already be this).

---

## 2. Page Setup

### SEO & Metadata

| Field | Value |
|---|---|
| URL slug | `/food-log/` |
| H1 | Food Log |
| Meta title | Daily Food Log - Track What You Eat | CaloricLab |
| Meta description | A simple, private food journal. Log your meals daily to build awareness of your eating habits. No calories, no macros, no account required. |
| Canonical | `https://caloriclab.com/food-log/` |

### Astro Page

Create `src/pages/food-log.astro`. Use the site's existing layout component for nav/footer/meta. The food log is a React island with `client:load`.

### File Structure

```
src/
  pages/
    food-log.astro
  components/
    food-log/
      FoodLog.tsx              # Main orchestrator
      MealSection.tsx          # Collapsible meal category with entries + input
      FoodEntry.tsx            # Single food item row
      PastDayCard.tsx          # Collapsed previous day log
      UndoToast.tsx            # Temporary undo notification
      useFoodLog.ts            # localStorage hook, daily management
```

---

## 3. Design Integration

### Use the same approach as the Habit Tracker page

This page shares the same dark background, typography, spacing, and visual language as the Habit Tracker. Read the site's global CSS for all token values.

### Background

Full dark mode. Use `--cl-dark-nav` (`oklch(10% 0.02 220)`) as the page background. Card surfaces use `--cl-dark-card` (`oklch(13% 0.025 220)`).

### Typography

- **H1 and section headers:** `var(--font-display)` — Cabinet Grotesk, weight 700
- **Body text, food entries, inputs, buttons:** `var(--font-sans)` — Satoshi, weight 400-500
- Do NOT import external fonts. Use what's already on the site.

### Meal Category Colors

Four meal categories, each with an accent color from the site's existing palette:

| Meal | Color | Source |
|---|---|---|
| Breakfast | Amber `#f59e0b` | Warm morning tone |
| Lunch | Teal/cyan — use the site's teal accent (check nav/pill values) | Site brand accent |
| Dinner | Violet — use `var(--cl-violet)` or the pill lavender `oklch(72% 0.18 292)` | Site brand accent |
| Snacks | Orange — use the site's orange accent (check nav/pill values, likely `#f97316`) | Site brand accent |

These colors are used for: the meal section icon stroke color, the thin accent bar on each food entry (3px vertical bar), the item count badge background, and the "+" button accent when adding.

### Text Hierarchy

Same as the Habit Tracker page:

| Level | Value | Usage |
|---|---|---|
| High emphasis | `rgba(255,255,255,0.88)` | H1, food entry text |
| Medium emphasis | `rgba(255,255,255,0.65)` | Meal section headers, past day labels |
| Low emphasis | `rgba(255,255,255,0.35)` | Calculator CTA links, helper text |
| Subtle | `rgba(255,255,255,0.18)` | "TODAY" label, "PREVIOUS DAYS" label |
| Muted | `rgba(255,255,255,0.20)` | Timestamps, item counts, input placeholders |

All text must pass WCAG AA against the dark background.

### Card & Surface Styling

Use `--glass-bg`, `--glass-border`, and `--glass-shadow` for the main today card if the Habit Tracker uses these. Otherwise match whatever card treatment the Habit Tracker uses — the two pages should feel like siblings.

### Animations

Use the site's existing easing curve: `cubic-bezier(0.16, 1, 0.3, 1)`. The undo toast slides up with this easing. Meal section collapse/expand can be a simple height transition or match however the Habit Tracker handles collapsible sections.

---

## 4. Feature Spec

### Today's Log

A single card containing four collapsible meal sections: Breakfast, Lunch, Dinner, Snacks. Each section has:

- **Header row:** Meal icon (SVG, 16px, stroked in meal color) + meal label + item count badge + collapse chevron
- **Entry list:** Each logged item shows a color accent bar (3px), the food text, and the timestamp (e.g., "2:30 PM"). On hover, an X button appears for deletion.
- **Input field:** Below the entries. Placeholder text contextual to the meal ("What did you have for breakfast?") when empty, "Add another..." when items exist. Enter key submits. A "+" button appears when text is present, colored to match the meal category.

### Empty State

When no food is logged today, show introductory text above the meal card: "Write down what you eat. No calories, no macros, no judgment. Just awareness. The first step to eating better is noticing what you eat now."

### Deleting an Entry

Hover an entry to reveal the X button. Clicking it removes the entry and shows an undo toast at the bottom of the screen. The toast persists for 4 seconds and contains the removed item's text + an "Undo" button. Clicking undo restores the entry. Only one undo is active at a time (new deletion replaces the previous undo).

Note: The undo toast uses `position: fixed` — verify this works correctly within the Astro layout. If the page is inside an iframe or transformed container, fixed positioning may need adjustment.

### "Clear Today" Button

In the page header, next to the date. Only visible when today has at least one entry. Clears all of today's meal entries. Resets to the empty state.

### Past Days

Below today's card, show up to 7 previous days as collapsed cards. Each card shows: the formatted date ("Yesterday", "Mon, May 26"), the total item count, and a collapse chevron.

Expanding a past day card shows all entries organized by meal category (only categories with entries are shown). Each past day has a "Delete this day" button that removes it from localStorage.

Past days are loaded on mount by scanning localStorage for keys matching `cl_foodlog_*` with dates before today, sorted newest first.

### Meal Icons (SVG)

Four simple SVG icons, all 16px, stroke-only (no fill), using the meal's accent color:

- **Breakfast:** Sun with rays (sunrise motif)
- **Lunch:** Full sun
- **Dinner:** Crescent moon
- **Snacks:** Coffee cup

These can use simple SVG paths or Phosphor icons if already available on the site.

---

## 5. State Management — `useFoodLog.ts`

### localStorage Schema

Each day gets its own key:

```
cl_foodlog_2026-05-31 = {
  date: "2026-05-31",
  meals: {
    breakfast: [
      { id: "breakfast_1717171200000", text: "2 eggs and toast", time: "2026-05-31T08:30:00.000Z" },
      { id: "breakfast_1717171260000", text: "Black coffee", time: "2026-05-31T08:32:00.000Z" }
    ],
    lunch: [...],
    dinner: [...],
    snacks: [...]
  }
}
```

### Key Format

`cl_foodlog_YYYY-MM-DD` — one key per day.

### TypeScript Interfaces

```typescript
interface FoodEntry {
  id: string;        // "{mealId}_{timestamp}" e.g. "breakfast_1717171200000"
  text: string;      // What the user typed
  time: string;      // ISO timestamp of when it was logged
}

interface DayLog {
  date: string;      // "YYYY-MM-DD"
  meals: {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snacks: FoodEntry[];
  };
}
```

### Entry ID Format

`{mealId}_{Date.now()}` — e.g., `breakfast_1717171200000`. This is unique enough for localStorage and provides natural sort order.

### On Mount

1. Read today's key (`cl_foodlog_YYYY-MM-DD`). If it exists, hydrate state. If not, initialize empty.
2. Scan all localStorage keys starting with `cl_foodlog_`. Filter out today. Sort by date descending. Take the 7 most recent. These become the past days list.

### Persistence

Write today's log to localStorage on every state change (via useEffect).

---

## 6. Cross-Linking

### From Food Log to Calculators

At the bottom of the page, a "Know your numbers" card with soft CTAs to: TDEE Calculator, Protein Calculator, Calorie Deficit Calculator. These are pill-shaped links, not aggressive CTAs. The framing: "Logging what you eat is the first step. When you are ready for the next one, find out how much your body actually needs."

### From Food Log to Habit Tracker

The Habit Tracker's built-in habit library could include a "Log your meals" habit. When someone has food log entries for today, that habit could auto-complete. This is a nice-to-have, not a launch requirement.

### From Calculators to Food Log

On calculator results pages, alongside the existing "Track this daily on your Daily Foundation" CTA, consider adding a "Start logging your meals" link to `/food-log/`. Again, nice-to-have for launch.

---

## 7. Responsive

### Desktop

Single column, max-width ~720px, centered. The four meal sections stack vertically inside the today card. Past day cards stack below.

### Mobile

Same single-column layout scales down naturally. Key considerations:
- Food entry X button should be visible on mobile (no hover state) — consider showing it always at reduced opacity, or use swipe-to-delete
- Input fields need adequate touch target size (min 44px height)
- Undo toast needs to not overlap the bottom nav if the site has one on mobile
- Timestamps on entries may need to be hidden on very narrow screens to prevent text overflow

---

## 8. Implementation Order

1. **Nav restructure** — Convert "Daily Foundation" nav item to a dropdown with "Habit Tracker" and "Food Log" sub-items. Verify habit tracker URL doesn't change.
2. **`useFoodLog.ts`** — localStorage read/write, today initialization, past day scanning.
3. **MealSection + FoodEntry** — The core input/display loop. Get adding and displaying working first.
4. **UndoToast** — Delete with undo flow.
5. **PastDayCard** — Previous day display and deletion.
6. **Page assembly** — Astro page, layout integration, dark background, responsive.
7. **Cross-linking** — Calculator CTAs at bottom, any links from calculators back.
8. **WCAG audit** — Contrast checks on all text/background combos.

---

## 9. Reference Prototype

A working React prototype exists as `food-log-prototype.jsx` in the project. It demonstrates the meal sections, entry flow, undo toast, past day cards, and calculator CTAs. The prototype uses placeholder fonts and approximate colors — rebuild all styling using the site's actual design tokens (Cabinet Grotesk, Satoshi, CSS custom properties) as specified above.
