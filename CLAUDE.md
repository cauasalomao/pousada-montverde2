# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML hotel website template built by Komplexa Hoteis. No build tools, no frameworks, no package.json — pure HTML5, CSS3, and vanilla JavaScript. Deploy to any static host (GitHub Pages, Netlify, Vercel).

This project is designed to be **replicable**: clone, swap out hotel-specific content (text, images, config constants), and deploy a new hotel site with the same design system.

## Development

No build or install step. Open any `index.html` in a browser or use a local server:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

There are no tests or linting configured.

## Architecture

### Page structure

Each page lives in its own directory with an `index.html` for clean URLs:

```
/index.html          — Home (hero + booking widget + discount popup)
/sobre/              — About the hotel
/experiencia/        — Facilities (pool, sauna, BBQ area, etc.)
/acomodacoes/        — Rooms grid with category filters (data-type: casal/familia/grupo)
/galeria/            — Photo gallery with lightbox and category filters (data-cat)
/localizacao/        — Google Maps embed + nearby attractions
/contato/            — Contact form + map
/blog/               — Blog listing page
/blog/{slug}/        — Individual blog posts
```

### Single CSS file: `assets/css/style.css`

All styling in one file. Uses CSS custom properties (design tokens) for theming — colors, spacing, fonts. Responsive via three breakpoints: 768px, 640px, 480px. Fluid spacing uses `clamp()`. Blog styles are at the end of the file.

### Single JS file: `assets/js/main.js`

All interactivity in one file. Key systems:
- **Webhook dispatcher** (`sendToWebhook`) — all forms POST JSON to a configurable webhook URL
- **GTM dataLayer** (`pushLead`) — fires `gerar_lead` events with lead type
- **UI components** — mobile menu, sticky header, lightbox gallery, modals (WhatsApp, discount popup), cookie banner, room/gallery filters, lazy image loading

### Hotel-specific constants (top of `main.js`)

```js
const WEBHOOK_URL = '...';  // Form submission endpoint
const WA_NUMBER   = '...';  // WhatsApp number (country code, no punctuation)
const HOTEL_NAME  = '...';  // Used in webhook payloads
```

### External integrations

- **HQ Beds** — booking engine iframe widget embedded in home page hero and acomodacoes
- **Google Tag Manager** — container ID hardcoded in every HTML file's `<head>` and `<body>` (noscript)
- **Google Maps** — iframe embeds in contato and localizacao pages
- **Webhook (CI Digital Marketing)** — receives all form submissions (WhatsApp modal, discount popup, contact form)
- **WhatsApp** — wa.me links with pre-filled messages

### SEO & structured data

Every page includes: Schema.org JSON-LD (LodgingBusiness, WebPage, BreadcrumbList), Open Graph tags, Twitter cards, canonical URLs. Site-level `sitemap.xml` and `robots.txt` at root.

## Configuration files

### `hotel-config.json`

Central config with all hotel-specific data: name, contact, address, amenities, rooms, integrations (webhook, GTM, HQ Beds), design tokens, and blog settings. Used by the remote agent to personalize content generation.

### `blog-plan.json`

Editorial strategy and content calendar. Contains:
- **editorial_strategy**: tone, word count, content pillars, posting schedule
- **seo_rules**: title format, slug rules, required meta tags, schema type
- **post_template**: required sections, CTA text
- **published**: array of published posts (slug, date, keywords)
- **upcoming**: array of planned posts with topic, target keywords, date, slug

## Blog system

### Structure

```
/blog/
  index.html                    — Listing page with grid of post cards
  _template/
    index.html                  — Template for new posts (has %%PLACEHOLDER%% markers)
  {slug}/
    index.html                  — Individual post (generated from template)
```

### Creating a new blog post (agent instructions)

1. Read `blog-plan.json` → pick next item from `upcoming`
2. Read `hotel-config.json` → use hotel context, tone, keywords for content
3. Copy `blog/_template/index.html` → `blog/{slug}/index.html`
4. Replace all `%%PLACEHOLDER%%` markers:
   - `%%POST_TITLE%%` → post title
   - `%%META_DESCRIPTION%%` → max 155 chars, includes target keyword
   - `%%SLUG%%` → URL slug from blog-plan
   - `%%ISO_DATE%%` → `YYYY-MM-DD` format
   - `%%DISPLAY_DATE%%` → `DD Mmm YYYY` in Portuguese (e.g., `11 Abr 2026`)
   - `%%PILLAR%%` → content pillar from blog-plan
   - `%%CONTENT_START%%` / `%%CONTENT_END%%` → replace entire block with post HTML
   - `%%RELATED_POSTS%%` → 2-3 blog cards linking to other published posts
5. Write the post content between `%%CONTENT_START%%` and `%%CONTENT_END%%`:
   - Intro: 2-3 paragraphs with primary keyword naturally included
   - Body: 3-5 sections with `<h2>` headings, useful and original content
   - Internal links: 2+ links to hotel pages (`../../acomodacoes/`, `../../contato/`, etc.)
   - CTA box at end using `.blog-cta-box` class
   - Word count: 800-1200 words
   - Tone: match `hotel-config.json > hotel.tone`
6. Add a blog card to `blog/index.html` inside `#blogGrid` (remove `#blogEmpty` when first post is added)
7. Add `<url>` entry to `sitemap.xml` with the new post URL
8. Move the post from `upcoming` to `published` in `blog-plan.json`
9. `git add` the new post, updated blog/index.html, sitemap.xml, and blog-plan.json → `git commit` → `git push`

### Blog post SEO checklist

Every post MUST have:
- [ ] Unique `<title>` with primary keyword (format: `{Title} | Blog Pousada MontVerde`)
- [ ] `<meta name="description">` ≤ 155 chars with primary keyword
- [ ] `<link rel="canonical">` pointing to the post URL
- [ ] Open Graph tags: `og:title`, `og:description`, `og:url`, `og:type=article`, `og:image`
- [ ] `<meta property="article:published_time">` with ISO date
- [ ] Schema.org `BlogPosting` JSON-LD with headline, datePublished, author, publisher
- [ ] `BreadcrumbList` JSON-LD: Home → Blog → Post Title
- [ ] Single `<h1>` (the post title)
- [ ] `<h2>` for each section, `<h3>` for subsections
- [ ] At least 2 internal links to hotel pages
- [ ] CTA box linking to reservas or contato
- [ ] GTM container loaded (already in template)

## Replicating for a new hotel

### Quick method (with `hotel-config.json`)

1. Clone this repository
2. Fill `hotel-config.json` with the new hotel's data (context, contact, integrations, design tokens, blog topics)
3. Run Claude Code and prompt: "Replique este site usando hotel-config.json. Gere todos os textos personalizados com base no contexto, público-alvo e tom de voz definidos."
4. Claude reads the config and generates personalized content for ALL pages — hero, sobre, experiência, acomodações, contato, SEO meta tags, Schema.org, footer
5. Replace images in `assets/img/`
6. Deploy

### Manual checklist

1. **Images**: Replace all files in `assets/img/` (hero, quartos, galeria, sobre). See README.md for dimensions.
2. **`main.js` constants**: Update `WEBHOOK_URL`, `WA_NUMBER`, `HOTEL_NAME`.
3. **HTML content**: In every `index.html`, replace hotel name, address, phone, email, CNPJ, Instagram, coordinates, descriptions, and room listings.
4. **GTM container ID**: Replace `GTM-MXDKKWH3` across all HTML files.
5. **HQ Beds widget**: Update the iframe `src` URL for the new hotel's booking engine.
6. **Google Maps iframes**: Generate new embed codes for the hotel's location.
7. **SEO meta tags**: Update `og:url`, `og:title`, canonical URLs, Schema.org JSON-LD on every page.
8. **`sitemap.xml`**: Update all URLs to the new domain.
9. **`blog-plan.json`**: Update topics, keywords, and content pillars for the new hotel's region.
10. **Design tokens** (optional): Adjust CSS custom properties in `style.css` (`:root` block) to match new hotel branding.

## Remote agent: automated blog generation

This project supports a scheduled remote agent that generates blog posts automatically.

### What the agent does (on each run)

1. Reads `blog-plan.json` → finds the next `upcoming` post whose `target_date` ≤ today
2. Reads `hotel-config.json` → uses hotel context for personalized, region-relevant content
3. Generates the post following the "Creating a new blog post" instructions above
4. Updates `blog/index.html` listing, `sitemap.xml`, and `blog-plan.json`
5. Commits and pushes to GitHub → GitHub Pages auto-deploys → Cloudflare serves

### Schedule configuration

Set up via Claude Code `/schedule` command:
- **Frequency**: twice per week (Tuesday and Friday)
- **Prompt**: "Read blog-plan.json. If there is an upcoming post with target_date ≤ today, generate it following the blog post creation instructions in CLAUDE.md. If no posts are due, do nothing."

### Replenishing the editorial calendar

When `upcoming` in `blog-plan.json` has ≤ 2 items, the agent should generate 6 more topics based on:
- `hotel-config.json > blog.topics_focus` — topical pillars
- `hotel-config.json > blog.seo_region_keywords` — regional SEO terms
- `editorial_strategy.content_pillars` — content categories
- Avoid duplicating topics already in `published`
- Generate slugs following `seo_rules.url_slug_format`

## Design tokens reference

| Token | Default | Purpose |
|---|---|---|
| `--accent` | `#3c614f` | Primary green — headers, buttons |
| `--cta` | `#92783b` | Gold — reserve/CTA buttons |
| `--bg` | `#f8f5f0` | Page background (cream) |
| `--font-display` | Pinyon Script | Decorative headings |
| `--font-body` | Raleway | Body text |

## Conventions

- All HTML uses semantic elements with BEM-like short class names (e.g., `.rc` for room card, `.gi` for gallery item, `.fbtn` for filter button).
- Data attributes drive JS behavior: `data-type` on room cards, `data-cat` on gallery items.
- Modals use `.open` class toggle pattern with `document.body.style.overflow = 'hidden'`.
- Forms prevent default, send webhook, then perform the UI action (open WhatsApp, show success message, close modal).
- Blog post content uses standard HTML (`<h2>`, `<p>`, `<ul>`, `<blockquote>`, `<a>`) — no custom components needed inside `.blog-post-content`.
- Blog CTA boxes use `.blog-cta-box` class with `<h3>`, `<p>`, and `.btn-green` link.
- Language is Brazilian Portuguese throughout.
