# Label Anant: architecture

## 1. What runs today

| Part | Where | Data |
|---|---|---|
| Shop (`/`) | GitHub Pages, static HTML/CSS/JS | `assets/catalogue.js` (17 products, sample prices, `verified:false`) |
| Product pages (`/p/la-1xx.html`) | Static, no scripts, Product + Breadcrumb JSON-LD | Built from the catalogue |
| Orders | WhatsApp click-to-chat with an order reference | Saved only on the customer's device (`localStorage`, prefix `la-`) |
| Owner dashboard (`/admin/`) | Static demo, `noindex` | Sample data in the browser (`labelanant-demo-db-v1`) |
| Demo shop (`/?demo=1`) | Same page, demo flag | Reads and writes the same sample data as `/admin/` |

Nothing in the demo leaves the browser. No payment, message, email or courier booking is real. The demo password (`demo1234`) protects nothing and must not be reused.

## 2. Target architecture

```
Customer browser ──► Shop (static, CDN) ──► API (serverless functions)
                                              │
Owner browser ───► Admin (static, auth) ─────►│──► Postgres (Supabase)
                                              │──► Storage (product photos)
                                              │
               Webhooks ◄─────────────────────┤
  Razorpay / Cashfree ── payment.captured ───►│  verify signature → mark paid
  Shiprocket ─────────── shipment status ────►│  update order, notify customer
  WhatsApp Cloud API ─── delivery / opt-out ─►│  update campaign, consent
```

Recommended stack (all have free or low entry tiers; confirm current pricing before signing up):

- **Database, auth, storage:** Supabase (Postgres with row-level security, email/OTP login, image storage).
- **API:** Supabase Edge Functions or Cloudflare Workers. All prices, totals, coupon checks and stock changes happen here, never in the browser.
- **Hosting:** stay on GitHub Pages for the static pages, or move to Cloudflare Pages / Vercel when a custom domain and API routes are added.
- **Payments:** Razorpay or Cashfree (UPI, cards, net banking). Order is confirmed only after the server verifies the webhook signature.
- **Shipping:** Shiprocket (rates, AWB, pickup, tracking webhooks).
- **WhatsApp:** WhatsApp Business Platform (Cloud API) with approved templates; marketing only to opted-in customers, with opt-out in every message.
- **Analytics:** GA4 + Google Search Console; Meta Pixel only with a cookie notice.

## 3. Database schema

Mirrors the demo tables in `assets/demo.js`, so the dashboard screens map one-to-one.

```sql
create table collections (id text primary key, name text not null, description text,
  featured boolean default false, status text check (status in ('active','hidden')));

create table products (id text primary key, sku text unique not null, name text not null,
  category text, description text, fabric text, colours text[], pattern text, embroidery text,
  components jsonb,            -- top, bottom, dupatta lengths and fabrics
  occasions text[], care text,
  price integer not null check (price > 0), mrp integer, gst_rate numeric,
  status text check (status in ('draft','active','hidden','archived')),
  launch_at timestamptz, seo_title text, seo_desc text, tags text[],
  verified boolean default false, created_at timestamptz default now());

create table product_collections (product_id text references products, collection_id text references collections,
  primary key (product_id, collection_id));

create table variants (id bigserial primary key, product_id text references products, colour text,
  sku text unique, stock integer not null default 0 check (stock >= 0), low_stock_threshold integer default 2);

create table product_images (id bigserial primary key, product_id text references products,
  url text not null, alt text, kind text check (kind in ('studio','detail','ai_styled','video')), position int);

create table customers (id uuid primary key default gen_random_uuid(), auth_user uuid unique,
  name text, phone text unique, email text, whatsapp_opt_in boolean default false,
  opt_in_at timestamptz, opt_out_at timestamptz, created_at timestamptz default now());

create table addresses (id bigserial primary key, customer_id uuid references customers,
  name text, line text, city text, state text, pin text check (pin ~ '^[1-9][0-9]{5}$'), is_default boolean);

create table orders (id text primary key, idempotency_key text unique not null,
  customer_id uuid references customers, address jsonb not null,
  subtotal integer, discount integer, coupon_code text, shipping integer, total integer,
  status text not null, payment_method text, created_at timestamptz default now());

create table order_items (order_id text references orders, variant_id bigint references variants,
  name text, sku text, qty int check (qty > 0), unit_price integer);

create table payments (id bigserial primary key, order_id text references orders, gateway text,
  gateway_order_id text, gateway_payment_id text unique, amount integer, status text,
  signature_verified boolean default false, raw jsonb, created_at timestamptz default now());

create table order_events (id bigserial primary key, order_id text references orders,
  from_status text, to_status text, by_user text, note text, at timestamptz default now());

create table shipments (order_id text primary key references orders, courier text, awb text,
  tracking_url text, status text, updated_at timestamptz);

create table returns (order_id text primary key references orders, reason text, status text,
  refund_amount integer, refund_ref text, updated_at timestamptz);

create table inventory_ledger (id bigserial primary key, variant_id bigint references variants,
  change integer not null, reason text, ref text, by_user text, at timestamptz default now());

create table coupons (code text primary key, type text check (type in ('percent','flat')), value integer,
  min_order integer default 0, expires_at timestamptz, usage_limit int, used int default 0, active boolean);

create table campaigns (id bigserial primary key, name text, channel text, segment text, message text,
  status text check (status in ('draft','approved','sent')), approved_by text, approved_at timestamptz,
  sent_at timestamptz, recipients int, delivered int, clicks int, orders int, revenue integer);

create table tickets (id bigserial primary key, customer_id uuid references customers, order_id text,
  subject text, status text, messages jsonb, created_at timestamptz default now());

create table audit_log (id bigserial primary key, at timestamptz default now(), user_id text,
  action text, ref text, detail jsonb);
```

Order statuses and allowed moves (enforced in the API, as `FLOW` does in the demo):

`placed → payment_verified | payment_failed | cancelled`, `payment_verified → confirmed`, `confirmed → processing → packed → shipped → delivered`, `delivered → return_requested → return_approved → returned → refund_pending → refunded`. Cancelling before dispatch releases stock; a failed payment releases stock.

## 4. API (server side)

| Endpoint | Does |
|---|---|
| `GET /api/products` | Active products, prices, stock bands (never exact stock) |
| `POST /api/checkout` | Validates address, re-prices from the database, checks coupon, reserves stock for 15 minutes, creates the gateway order. Requires an idempotency key. |
| `POST /api/webhooks/payment` | Verifies the gateway signature, marks paid, confirms the order, sends the WhatsApp confirmation template |
| `POST /api/webhooks/shipping` | Updates shipment and order status, notifies the customer |
| `POST /api/webhooks/whatsapp` | Delivery receipts and STOP/opt-out |
| `GET /api/orders/:id` | Customer tracking (phone + order ID, or signed-in customer) |
| `/api/admin/*` | Owner-only: orders, products, stock, coupons, campaigns, reports. Role checked on every call. |

## 5. Security

- Secrets (gateway keys, WhatsApp token, Shiprocket token, service-role key) live only in the API's environment variables. Never in the repository or the browser.
- Row-level security: customers read only their own orders and addresses; only the owner role reaches admin tables.
- Owner login with two-factor authentication; staff accounts with limited roles (packing, support).
- Every price, discount and total is recomputed on the server. The browser total is display only.
- Webhook signatures verified; duplicate webhook deliveries ignored using the gateway payment ID.
- Rate limits on checkout, OTP and tracking. Audit log for every owner action.
- Content Security Policy on all pages; product pages already run with `script-src 'none'`.

## 6. Migration path

1. Confirm real prices, stock, fabric details and policies (see `AUDIT.md`). Set `verified:true` per product.
2. Buy a domain (for example `labelanant.com` or `.in`) and point it at the host.
3. Create the Supabase project; run the schema; import products from the dashboard's Excel export.
4. Move `/admin/` to real sign-in; swap the demo data layer (`LA_DEMO`) for API calls. The screens stay the same.
5. Open a Razorpay or Cashfree account (needs PAN, bank account, GSTIN if registered, policy pages live). Test in sandbox, then switch on.
6. Open Shiprocket; connect pickup address; test one shipment.
7. WhatsApp Business Platform: verify the business, register the number, get templates approved (order confirmation, shipped, delivered, back in stock).
8. GA4 and Search Console; submit `sitemap.xml`.
9. Turn off the WhatsApp-only checkout once online payment is proven, or keep both.
