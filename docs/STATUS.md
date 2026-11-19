# Label Anant: status (20 Nov 2026)

## Done

**Shop**
- Premium storefront: hero slider, collections, studio, detail and AI-styled looks (tagged), quick view, wishlist, search, filters.
- Checkout in four steps: address with validation, delivery, payment, review. Buy now. Saved addresses. Sticky add-to-bag on phones.
- Live orders go to WhatsApp with an order reference; My orders and Track order on the device.
- Online payment shown as "coming soon" (not active).
- SEO: 17 product pages with structured data, sitemap, robots, 404 page, meta tags.

**Owner dashboard (`/admin/`, demo data)**
- Dashboard with sales, orders, attention list and charts.
- Orders: status flow with audit trail, courier and tracking, returns and refunds, invoice (marked DEMO), WhatsApp message drafts.
- Products: add, edit, photos, variants, bulk price change, Excel export, CSV import.
- Inventory: stock ledger, adjustments, low-stock alerts.
- Customers and support tickets; segments.
- Marketing: coupons, WhatsApp campaigns with approval and opt-out rules, abandoned checkouts (consented only).
- Reports with Excel export; rule-based assistant; settings with announcements, homepage collection, policy drafts.
- Demo shop (`/?demo=1`) reflects dashboard changes and places simulated orders.

**Documents:** `AUDIT.md`, `ARCHITECTURE.md`, `TESTING.md`, this file.

## Needs the owner's data

- Real prices, stock, fabric and length details for each suit (all current prices are samples).
- Return, exchange, shipping, privacy and terms policies (drafts in the dashboard have `[brackets]`).
- GSTIN, business email, pickup address, dispatch time.
- Real customer reviews only, with permission. None are shown now.

## Needs accounts (cannot be done from a static site)

| Item | Needs |
|---|---|
| Real dashboard login and shared data across devices | Supabase (or similar) backend |
| Online payment | Razorpay or Cashfree account, KYC, policy pages live |
| Courier booking and tracking | Shiprocket account |
| Automatic WhatsApp messages and campaigns | WhatsApp Business Platform, verified business, approved templates |
| Customer accounts across devices (OTP login) | Backend + SMS/WhatsApp OTP |
| AI assistant on real data | Backend + AI API key kept on the server |
| Custom domain | Domain purchase |
| Analytics | GA4 and Search Console access |

## Not built, by design

- No fake reviews, testimonials, "only 2 left" timers or invented ratings.
- No simulated payment or order is shown as real outside demo mode.
- No secrets in the code.
