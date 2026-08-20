# Abloom Tree Care — Website

Static marketing site for **Abloom Tree Care** (abloomtreecare.com.au) — qualified arborists based in Sutton NSW, servicing Canberra, the ACT and the surrounding districts.

Built to the Local Service Pro SEO strategy (Aug 2026): keyword-targeted pages, LocalBusiness / Service / FAQPage / BreadcrumbList schema, full NAP + 11 service areas as on-page text, descriptive alt text on every image, self-referencing canonicals, `og:locale` `en_AU`, sitemap and robots.

## Structure

```
index.html                          → /            tree removal canberra (primary keyword)
services/tree-removal/index.html    → /services/tree-removal/    tree lopping canberra
services/tree-pruning/index.html    → /services/tree-pruning/    tree pruning canberra (incl. cable bracing & planting)
services/stump-grinding/index.html  → /services/stump-grinding/  stump grinding canberra
services/hedge-trimming/index.html  → /services/hedge-trimming/  hedge trimming canberra
services/emergency-tree-removal/index.html → /services/emergency-tree-removal/  emergency tree removal canberra
services/arborist-reports/index.html → /services/arborist-reports/  arborist report canberra (consultancy arm)
about/index.html / contact/index.html / thank-you/index.html
assets/css/styles.css               → shared design system
assets/js/main.js                   → nav, scroll-reveal animations, counters, form
assets/img/                         → optimized client photos (webp) + logo + favicons
sitemap.xml / robots.txt
```

URLs are extensionless: every page lives as `index.html` inside its own directory
(`/about/`, `/services/tree-removal/`, …), which every static host serves without
configuration. `index.html` (home) stays at the root.

No build step — deploy the folder to any static host. Pages use root-absolute paths (`/assets/...`), so serve from the domain root.

## Forms & GHL tracking

Quote forms (`/` + `/contact/`) are wired for GoHighLevel form-submission capture:

- Field `name` attributes map to GHL contact fields: `full_name`, `email`, `phone`, `service_needed`, `property_address`, `property_size`, `job_notes`.
- Forms submit through the **native submit event** (no `preventDefault`) via GET to `/thank-you/`, which personalises itself from the submitted values and then cleans the URL.
- The GHL external-tracking script (`link.msgsndr.com/js/external-tracking.js`, tracking id `tk_9bf473d65ddc4747a317efd9ea236062`) is included before `</body>` on every page.
- In GHL: enable **Form Analytics** and **Form Submissions** in Settings, and create the custom fields `service_needed`, `property_address`, `property_size`, `job_notes` so they map onto the contact.

## Launch checklist

- [ ] **Analytics**: add the GA4 tag to all pages; verify the domain in Google Search Console and submit `sitemap.xml`.
- [ ] **Opening hours**: add `openingHoursSpecification` to the LocalBusiness schema on `index.html` once confirmed with the client (left out rather than guessed).
- [ ] Confirm the hero/section photo choices with Jake — all photos come from the client's Drive folder and can be swapped in `assets/img/`.
