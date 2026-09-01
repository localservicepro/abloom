# Abloom Tree Care — Website

Static marketing site for **Abloom Tree Care** (abloomtreecare.com.au), a Canberra arboriculture company servicing the ACT and the surrounding NSW districts.

Positioned as an **arboriculture / tree management** company per the client change doc (26 & 28 Aug 2026 amendments, 74 items applied). Built to the Local Service Pro SEO strategy: keyword-targeted pages, LocalBusiness / Service / FAQPage / BreadcrumbList schema, business name, postal address and phone plus 11 service areas as on-page text, descriptive alt text on every image, self-referencing canonicals, `og:locale` `en_AU`, sitemap and robots.

## Structure

```
index.html                          → /            arborist canberra / tree management (primary)
services/tree-removal/index.html    → /services/tree-removal/    tree removal canberra
services/tree-pruning/index.html    → /services/tree-pruning/    tree pruning canberra (incl. cable bracing & planting)
services/stump-grinding/index.html  → /services/stump-grinding/  stump grinding canberra
services/hedge-trimming/index.html  → /services/hedge-trimming/  hedge trimming canberra (labelled "Hedge Pruning")
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

## Client copy rules (from the change doc)

These apply site-wide. Keep them in mind for any future copy:

- **No em dashes.** The client reads them as AI-written. Use full stops, commas or an en dash in definition lists.
- **No personal name and no street address.** Equipment-theft risk. Postal address only: P.O. Box 4429 Kingston ACT 2604. Location is always "Canberra", never a specific suburb base.
- **Arboriculture first.** The business manages trees; removal is one service, not the positioning. "Tree Removal Canberra" must not appear as the homepage title, H1 or meta.
- **Credentials matter.** AQF 5 (consulting) and AQF 3 (climbing) arborists, AS 4373-2007 for pruning, VALID for risk assessments, Urban Forest Act 2023 for ACT tree protection.
- **No "lopping" as a service.** It appears only on the tree pruning page, where it is explained as poor practice.
- **No powerline work claims.** Removed site-wide.

## Launch checklist

- [ ] **Analytics**: add the GA4 tag to all pages; verify the domain in Google Search Console and submit `sitemap.xml`.
- [ ] **Opening hours**: add `openingHoursSpecification` to the LocalBusiness schema on `index.html` once confirmed with the client (left out rather than guessed).
- [ ] **Remaining pages**: the change doc only covered Home, Tree Removal and Tree Pruning. Stump Grinding, Hedge Pruning, Emergency Works, Arborist Consultancy, About and Contact have had the global rules applied but have not been reviewed line by line by the client.
- [ ] Confirm the hero/section photo choices with the client. All photos come from their Drive folder and can be swapped in `assets/img/`.
