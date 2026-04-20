# CaloricLab.com — Project Instructions

## What This Is

CaloricLab.com is a nutrition calculator suite designed to capture organic

search traffic and monetize through display advertising. The site offers

free, science-backed calculators (TDEE, calorie deficit, macros, BMR,

protein) with SEO content on each page. A blog powered by Decap CMS

supports long-tail keyword growth.

## Tech Stack

- **Framework:** Astro (static site generator)

- **Styling:** Tailwind CSS

- **Calculator components:** React islands (hydrated with client:load)

- **Blog CMS:** Decap CMS (git-based, markdown files in src/content/blog/)

- **Hosting:** Cloudflare Pages (free tier)

- **Auth:** Cloudflare Functions for Decap CMS GitHub OAuth

## Design Direction

- Look at the screenshots in /Screenshots/ for UI inspiration

- Clean, modern, mobile-first design

- Color palette: Fresh, health-oriented — greens, clean whites, warm grays

- No gradients. Flat and modern. Premium feel without being flashy.

- Typography: Clear hierarchy. Large, readable calculator results.

- Calculators should feel like high-quality apps, not academic tools

- Brand name: CaloricLab — position as precise, science-backed, trustworthy

## Site Structure

Pages:

- / (homepage)

- /tdee-calculator/

- /calorie-deficit-calculator/

- /macro-calculator/

- /bmr-calculator/

- /protein-calculator/

- /blog/ (index + individual posts)

- /about/

- /privacy/

- /terms/

## Navigation

Top nav: [CaloricLab logo/name] — Calculators (dropdown) — Blog — About

Footer: Privacy, Terms, Contact, Calculators index, Blog index

Mobile: Hamburger menu

## Calculator Formulas

All calculators use the Mifflin-St Jeor equation by default:

- Male BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5

- Female BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161

- If body fat % provided: Katch-McArdle: BMR = 370 + (21.6 × lean_mass_kg)

- TDEE = BMR × activity_multiplier

Activity multipliers:

- Sedentary: 1.2

- Lightly Active: 1.375

- Moderately Active: 1.55

- Very Active: 1.725

- Extremely Active: 1.9

## SEO Requirements

- Every page needs: unique <title>, meta description (150-160 chars),

  Open Graph tags, canonical URL

- Calculator pages need: FAQ structured data (JSON-LD), BreadcrumbList

- Blog posts need: Article structured data (JSON-LD)

- Auto-generated sitemap.xml

- robots.txt allowing all crawlers

## Content Conventions

- Blog posts stored in src/content/blog/ as .md files

- Frontmatter: title, pubDate, description, author, heroImage, tags

- Internal links between calculator pages (every calculator links to 2-3 related ones)

- SEO content below each calculator: 1,200-1,500 words

- Tone: Knowledgeable but approachable, like a coach talking to a client

## File Organization

src/

  components/       → React calculator components, shared UI components

  content/

    blog/           → Markdown blog posts (managed by Decap CMS)

  layouts/          → Shared page layouts

  pages/            → Astro page routes

    blog/           → Blog index and [slug] pages

  styles/           → Global styles

public/

  admin/            → Decap CMS admin panel (index.html + config.yml)

  images/           → Static images

functions/

  api/              → Cloudflare Functions (Decap OAuth auth.js + callback.js)
