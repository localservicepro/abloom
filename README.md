# Abloom Tree Care — Website

Static marketing site for **Abloom Tree Care** (abloomtreecare.com.au), a Canberra arboriculture company servicing the ACT and the surrounding NSW districts.

Positioned as an **arboriculture / tree management** company per the client change doc (26 & 28 Aug, then 2–5 Sep 2026 amendments; 116 items applied). Built to the Local Service Pro SEO strategy: keyword-targeted pages, LocalBusiness / Service / FAQPage / BreadcrumbList schema, business name, postal address and phone plus 11 service areas as on-page text, descriptive alt text on every image, self-referencing canonicals, `og:locale` `en_AU`, sitemap and robots.

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
assets/css/styles.css               → shared design system (source of truth, inlined into each page)
assets/js/main.js                   → nav, scroll-reveal animations, counters, form, video facade
assets/fonts/                       → self-hosted Bricolage Grotesque + Public Sans (latin, woff2)
tools/                              → inline-css.py, build-image-variants.py, build-srcset.py
assets/img/                         → optimized client photos (webp) + logo + favicons
assets/img/icons/                   → client-supplied service icons (webp, 256px, transparent)
sitemap.xml / robots.txt
```

URLs are extensionless: every page lives as `index.html` inside its own directory
(`/about/`, `/services/tree-removal/`, …), which every static host serves without
configuration. `index.html` (home) stays at the root.

No bundler, no framework — deploy the folder to any static host. Pages use root-absolute paths (`/assets/...`), so serve from the domain root.

## Performance: generated assets

The site is tuned for Core Web Vitals on a throttled mobile connection, which
means some assets are generated rather than hand-written. **Each has a single
source of truth; run the matching script after editing it.**

| You edited | Run | Why |
| --- | --- | --- |
| `assets/css/styles.css` | `python3 tools/inline-css.py` | The stylesheet is minified and inlined into all 10 pages. An external stylesheet is a render-blocking round trip worth roughly a second of First Contentful Paint on mobile. The `.css` file is the source of truth and is no longer requested by the browser. |
| Added or replaced a photo | `python3 tools/build-image-variants.py` then `python3 tools/build-srcset.py` | Builds the `-400w`/`-550w`/… renditions and rewrites every `srcset`, `sizes` and the homepage LCP preload from whatever is on disk. |

Both scripts are idempotent, so running them when nothing changed is a no-op.

Other deliberate performance choices, in case they look odd:

- **Fonts are self-hosted** in `assets/fonts/` (latin subset, variable woff2) and preloaded. Google Fonts cost a render-blocking third-party stylesheet plus two extra TLS handshakes.
- **The homepage video is a click-to-play facade.** Nothing is requested from YouTube, and no third-party cookies are set, until the visitor presses play. Playback then uses `youtube-nocookie.com`. The poster is `assets/img/video-poster.webp`.
- **The GHL tracking script is `defer`red** so it cannot block the parser. It still runs before `DOMContentLoaded`, which is what form-submission capture needs.
- **Logos and service icons are sized for their slot** (190x86 and 96x96), not scaled-down large files.

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
- **Legislation is linked, not just named.** ACT legislation referenced on the arborist consultancy page links to legislation.act.gov.au.
- **Consulting arborists are AQF Level 5, climbing arborists AQF 3.** Write them out in full rather than abbreviating in body copy.

## Launch checklist

- [x] **GA4**: measurement id `G-XZVPM07RCF`, installed on all 10 pages. On `/thank-you/` the tag passes an explicit stripped `page_location`, because the quote forms submit by GET and the visitor's name, email and phone are in the query string. Do not remove that override.
- [ ] **Search Console**: verify the domain and submit `sitemap.xml`.
- [ ] **Opening hours**: add `openingHoursSpecification` to the LocalBusiness schema on `index.html` once confirmed with the client (left out rather than guessed).
- [ ] **About page photo 2**: the change doc asks for `About Photo 2`, which is not in the Drive `New Photos` folder. The existing rigging photo is still in that slot.
- [ ] Confirm the hero/section photo choices with the client. All photos come from their Drive folder and can be swapped in `assets/img/`.
- [ ] `assets/video/` still holds the two self-hosted encodes (14 MB). Nothing references them now that the homepage is back on YouTube — delete them if the client is sure.
- [ ] The video facade poster is a frame from the client's own footage. If the YouTube video is different footage, swap `assets/img/video-poster.webp` for a still from it.
