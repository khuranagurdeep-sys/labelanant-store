# Label Anant store: audit (20 Nov 2026)

Site audited: https://khuranagurdeep-sys.github.io/labelanant-store/ (branch `main`, commit 07d672d)
Method: code review of `index.html`, automated browser checks at 1440 px and 390 px (Chrome), and manual walk-throughs of every flow.

## 1. Technology and structure

| Item | Finding |
|---|---|
| Hosting | GitHub Pages, static. HTTPS and HSTS on; 10-minute cache. |
| Code | One `index.html` (≈178 KB, vanilla HTML/CSS/JS, no framework, no build step needed) and `img/` (56 images, 6.7 MB). |
| Data | 17 products hard-coded in a `P` array inside `index.html`. |
| State | Bag, wishlist and recently viewed saved in the browser (`localStorage`). |
| Ordering | Bag form opens a pre-filled WhatsApp message to +91 99101 88555. No payment, no order record kept anywhere. |
| Libraries | None. Fonts from Google Fonts. |

Verdict: a solid, fast static storefront. It should be kept and extended, not replaced. A real order system needs a server and database, which GitHub Pages cannot host (see `ARCHITECTURE.md`).

## 2. Area-by-area review

| # | Area | Working | Gaps |
|---|---|---|---|
| 1 | Homepage | Full-screen 5-banner slider, collections, trending tabs, occasions, colours, price tiles, spotlight, fabric guide, story, FAQ. | No "bestsellers" (no sales data yet). |
| 2 | Navigation | Dropdown Shop menu, quick-link pills, slim header on scroll, phone tab bar. | No About or Contact entries in the main menu. |
| 3 | Categories | Wedding edit, Embroidered, Banarasi, Velvet, Printed; 6 occasions; 14 colours; 3 price bands. | Categories are hard-coded. |
| 4 | Photographs | Real suit photos, studio cut-outs, close-ups, AI-styled wearing looks (tagged). | 10 older suits use low-resolution Instagram crops. No back views or videos. |
| 5 | Descriptions | Present for all 17 suits. | Written from photos, not verified. No fabric composition or lengths. |
| 6 | Prices and variants | Shown on every suit; LA-112 has 3 colour variants carried into the order. | **All prices are samples** (flagged on the site). No MRP, GST or stock. |
| 7 | Search | Header search drawer and in-grid search over name, code, fabric, colour, occasion. | No instant suggestions in the header field itself. |
| 8 | Filters | Collection, occasion, colour, price, sort; active-filter chips. | No fabric or availability filter (no stock data). |
| 9 | Wishlist | Works; saved in the browser. | Not synced across devices (needs accounts). |
| 10 | Bag | Quantities, remove, move to wishlist, totals. | No coupons, no saved addresses. |
| 11 | WhatsApp ordering | Validated name, phone, address, city, PIN; message includes items, colour and total. | No order reference; phone not checked as an Indian mobile; customer keeps no record. |
| 12 | Enquiries | "Ask on WhatsApp" on every suit, floating chat button, styling-help form. | Enquiries are not logged anywhere. |
| 13 | Brand story | "Meet the designer" with Jaspriya Khurana. | Short; no founding story or craft details (needs verified text). |
| 14 | Mobile | Tested at 390 px: no overflow, bottom tab bar, swipeable slider. | Product page has no sticky buy bar. |
| 15 | Footer and policies | Shop, help, account, contact columns. | **No privacy, terms, shipping, cancellation, returns or refund policies.** No business disclosures (legal name, GST). |
| 16 | SEO | One `h1`, 25 `h2`, meta description, alt text on product images. | No canonical, Open Graph, structured data, sitemap or robots.txt (all return 404). Products live behind `#p-…` hash links, which search engines do not index. |
| 17 | Performance | DOMContentLoaded 0.8 s (phone), 1.6 s (desktop) on a local server; images lazy-load. | 6 MB of images if a visitor scrolls the whole page; some JPGs are 250–290 KB. |
| 18 | Accessibility | Labelled icon buttons, focus outlines, reduced-motion support, alt text. | Footer links are under 24 px tall on phones; some low-contrast small text on light banners. |
| 19 | Security | No secrets in code; HTTPS; external links use `rel=noopener`. | No Content-Security-Policy (GitHub Pages cannot set headers; a meta CSP can be added). No admin exists, so nothing is exposed yet. |
| 20 | Architecture | Simple and maintainable. | Product data mixed into the page code; no data source an admin could edit. |

## 3. Placeholders that must be verified before launch

1. All 17 prices (₹1,850–₹3,650) are samples.
2. All product names and descriptions were written from photos.
3. LA-112 price ₹2,895 was read from a tag in a photo; confirm it is the price.
4. Fabric names (Banarasi, velvet, crepe, Kalamkari) are inferred from photos.
5. "Free shipping across India" comes from the Instagram bio; confirm it still applies.
6. No stock quantities, MRP, GST rates, delivery times or return rules exist yet.
7. Seven wearing photos are AI-styled from the real fabric photos and are tagged as such; the purple velvet look had to guess the kurta.

## 4. Prioritised recommendations

**Now (done in this round, see `STATUS.md`)**
1. Proper checkout steps (address → delivery → payment → review → confirmation) with an order reference, Indian mobile validation and saved addresses; WhatsApp stays the live payment route until a gateway is approved.
2. Buy Now, sticky phone buy bar, availability note.
3. Customer area: orders placed from this device, saved addresses, order tracking request.
4. SEO: canonical, Open Graph, Product and Organization structured data, one indexable page per suit, sitemap, robots.txt.
5. Owner dashboard demo at `/admin` covering products, stock, orders, customers, marketing, reports and an assistant, on clearly marked sample data.

**Next (needs your decisions and accounts)**
6. Verify prices, fabrics, stock and policies; enter them in the dashboard.
7. Backend and database (Supabase recommended), then switch the dashboard from demo data to live data.
8. Razorpay or Cashfree payments with server-side verification and webhooks.
9. Shiprocket for rates, labels and tracking.
10. WhatsApp Business Platform for order messages; GA4 and Search Console.

**Later**
11. Real customer accounts across devices, loyalty and referrals, bestsellers from real sales, product videos, back views.
