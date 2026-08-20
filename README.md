# Abloom Tree Care — Website

Static marketing site for **Abloom Tree Care** (abloomtreecare.com.au) — qualified arborists based in Sutton NSW, servicing Canberra, the ACT and the surrounding districts.

Built to the Local Service Pro SEO strategy (Aug 2026): keyword-targeted pages, LocalBusiness / Service / FAQPage / BreadcrumbList schema, full NAP + 11 service areas as on-page text, descriptive alt text on every image, self-referencing canonicals, `og:locale` `en_AU`, sitemap and robots.

## Structure

```
index.html                        → tree removal canberra (primary keyword)
services/tree-removal.html        → tree lopping canberra
services/tree-pruning.html        → tree pruning canberra (incl. cable bracing & planting)
services/stump-grinding.html      → stump grinding canberra
services/hedge-trimming.html      → hedge trimming canberra
services/emergency-tree-removal.html → emergency tree removal canberra
services/arborist-reports.html    → arborist report canberra (consultancy arm)
about.html / contact.html
assets/css/styles.css             → shared design system
assets/js/main.js                 → nav, scroll-reveal animations, counters, form
assets/img/                       → optimized client photos (webp) + logo + favicons
sitemap.xml / robots.txt
```

No build step — deploy the folder to any static host. Pages use root-absolute paths (`/assets/...`), so serve from the domain root.

## Launch checklist

- [ ] **Quote form**: no backend is wired yet. Create a form endpoint (Formspree, Basin, Netlify Forms, etc.) and set it as `data-endpoint="https://..."` on each `<form class="js-quote">` (index.html + contact.html). Until then, submissions show a "call us" fallback message.
- [ ] **YouTube video**: replace the video placeholder block on `index.html` (marked with `<!-- VIDEO PLACEHOLDER -->`) with the iframe embed — instructions are in the comment.
- [ ] **Analytics**: add the GA4 tag to all pages; verify the domain in Google Search Console and submit `sitemap.xml`.
- [ ] **Opening hours**: add `openingHoursSpecification` to the LocalBusiness schema on `index.html` once confirmed with the client (left out rather than guessed).
- [ ] Confirm the hero/section photo choices with Jake — all photos come from the client's Drive folder and can be swapped in `assets/img/`.
