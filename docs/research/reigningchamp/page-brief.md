# reigningchamp.com — homepage brief

Source: https://reigningchamp.com/ (Shopify, Dawn-derived theme), inspected 2026-10-09.
Local route: `/` → `src/app/page.tsx`, components in `src/components/sites/reigningchamp/`,
assets in `public/sites/reigningchamp/` (fetched by `scripts/download-reigningchamp-assets.sh`).
Screenshots: `docs/design-references/reigningchamp/`.

## Global
- Fonts (site's own files): `akzidenz-grotesk` 400, `akzidenz-grotesk-med` 500, `akzidenz-grotesk-condensed` 700 (bold condensed).
- Body 12px / 18px, letter-spacing ~1px, black on white. Nav/labels uppercase with 1.2px tracking.
- Breakpoints: 750px (mobile ↔ tablet layouts), 990px (desktop nav ↔ hamburger drawer).
- Gutter 32px (≥750), 12px (<750).

## Sections (1440 × 900)
| # | Section | Geometry |
|---|---|---|
| 1 | Announcement bar, black, 42px | left "New In: Fall '26 Arrivals. Shop New", right "Free shipping on US orders $50+" (mobile: left message centered only) |
| 2 | Sticky header, 60px | Transparent over hero (white text) until scrollY > ~70 or header hover → white bg/black text. Logo 27×24; nav 12px uppercase, 24px gaps; right: shipping selector, search, bag, wishlist, account (20px icons, 20px gaps). |
| 3 | Hero video "REFINED UTILITY" | full width, height `100dvh − 42px` (≥750), 4:5 (<750). Copy bottom-left: 48px bold-condensed (32px mobile), 16px subcopy (12px), "SHOP NEW" underlined. |
| 4 | New Arrivals carousel | h2 16px med (12px mobile); 12 cards, scroll-snap, gap 6 (4 mobile). Card width ≈ 22.29vw − 1 (40vw mobile), image 4:5 on #f? product backdrop. "New" badge top-left, wishlist button top-right. Name left / price right on one row (12px); mobile 9px stacked. Prev/next 48px white square buttons on hover (desktop). |
| 5 | Two-up content cards | 2 cols × (W−70)/2, 4:5, gap 6; text bottom-left inset 38px: h3 16 med, p 16, SHOP NOW 16 underlined. Mobile: stacked, 12px type. |
| 6 | Shop by Category | same card geometry as carousel; 5 items, label 12px uppercase (9px mobile). |
| 7 | Performance video banner | inset 32px, 600px tall desktop video; mobile 4:5 separate mobile video. |
| 8 | Recently viewed (empty state) | h2 + "There are no recently viewed items to show." + "Shop New Arrivals". |
| 9 | Footer, black | 2 link columns (label 9px #ccc, links 12px uppercase, 34px rhythm) + ALL ACCESS newsletter (32px condensed), socials. |
| 10 | Sub-footer | border-top #333-ish, legal links #808080 with separators; copyright + shipping selector right. |

## Interactions
- Mega menus (hover, desktop): Latest, Clothing, Accessories, Shop By. Full-width white panel under header, columns 236px wide at 260px pitch, 9px grey headings, 12px links on 34px rhythm, 336×420 image + caption at right (x=1080).
- Hovered nav item underlined. Header turns white on any hover.
- Mobile drawer (hamburger): slides from right, 360px wide, page blurred behind; rows 59px with 1px black dividers, chevrons for submenus; submenu panel with back button + title; footer links Account / Contact Us / About Us + shipping selector.
- Videos autoplay muted loop.
- Out of scope (link to source): product, collection, policy pages, search, cart, account, wishlist.

## Clone status
- Route map: `https://reigningchamp.com/` → `/` (`src/app/page.tsx`). All other destinations link to the live store.
- Verified page height parity: 4163px @1440, 4048px @390, 4730 vs 4729px @1920.
- Known differences: newsletter submit shows a local confirmation (no Klaviyo/Shopify post); search, cart, account,
  wishlist page and product/collection pages are not cloned; the cookie banner and "All Access" popup are omitted;
  at 750–990px the subfooter "Shipping to" wraps differently than the source.
