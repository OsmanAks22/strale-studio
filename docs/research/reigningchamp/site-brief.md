# reigningchamp.com — full-site clone brief

Every link on the cloned homepage now resolves to a local route. Data is a snapshot of the live
Shopify store (2026-10-09), written to `src/components/sites/reigningchamp/catalog/*.json` by
`scripts/reigningchamp/` (fetch_collections → scrape_collection_pages → scrape_products → scrape_pages → build_catalog).

## Route map
| Source | Local route | Data |
|---|---|---|
| `/` | `src/app/page.tsx` | homepage (local assets) |
| `/collections/<handle>` (43 collections, source query params kept: `filter.p.m.custom.*`, `filter.v.option.*`, `filter.v.availability`, `sort_by`) | `src/app/collections/[handle]/page.tsx` | `getCollection`, `getProducts` |
| `/search?q=` | `src/app/search/page.tsx` | `getProducts` |
| `/products/<handle>` (769 products) | `src/app/products/[handle]/page.tsx` | `getProduct`, `getProductDetails`, `getColourways` |
| `/pages/<handle>` (26 pages incl. policies, stores, fit guides) | `src/app/pages/[handle]/page.tsx` | `getPages` |
| `/pages/wishlist` | `src/app/pages/wishlist/page.tsx` | localStorage (`useWishlist`) |
| `/blogs/the-intermission`, `/blogs/the-intermission/<article>` (51 posts) | `src/app/blogs/the-intermission/...` | `getBlog` |
| `/cart` | `src/app/cart/page.tsx` | localStorage (`useCart`) |
| `/account`, `/account/login`, `/account/register` | `src/app/account/...` | static forms (no backend) |

Collection aliases (`/collections/jackets` → `mens-jackets`, etc.) come from `aliases.json`; `getCollection()` resolves them.

## Shared building blocks (owned by the lead — do not edit; ask instead)
- `catalog.ts` — server-only loaders + types (`Product`, `ProductDetails`, `Collection`, `Page`, `PageSection`, `Blog`, `ProductSummary`, `toSummary`).
- `stores.ts` — client stores: `useCart`/`cart`, `useWishlist`/`wishlist`, `useRecentlyViewed`/`recordView`.
- `format.ts` — `formatPrice`, `sizeLabel`.
- `product-grid-card.tsx` — catalog card (image, New badge, wishlist, name/price, swatches).
- `wishlist-button.tsx`, `slider.tsx` (`Slider`, `SliderItem`), `recently-viewed.tsx`, `icons.tsx`.
- Root layout renders announcement bar, sticky header, footer; pages render only their `<main>` content.
- Images: `next/image` with a custom loader (`image-loader.ts`) that sizes Shopify CDN URLs via `width=`; pass CDN URLs straight to `<Image>`.
- `.rc-rte` class in `globals.css` styles sanitised HTML.
- Breakpoints: `tab:` = 750px, `desk:` = 990px. Gutters 12px / 32px. Type: body 12px/18px, tracking 1px; labels uppercase tracking 1.2px; `font-rc-med`, `font-rc-cond`.

## Known gaps
- Facet values are derived from product tags; the source uses Shopify metafields, so some values (e.g. Henley, Mockneck) are missing or counts differ.
- Editorial image tiles inside collection grids are not reproduced.
- Checkout, account login and newsletter posting have no backend in the clone.
