# Label Anant: testing

Automated browser tests (Playwright, Chromium) at 1440 px desktop and 390 px phone. Last run: 20 Nov 2026. Result: **61 of 61 passed, no console errors.**

## Shop, live mode (desktop and phone)

| Check | Desktop | Phone |
|---|---|---|
| No demo strip in live mode | Pass | Pass |
| Availability note on product | Pass | Pass |
| Buy now opens checkout | Pass | Pass |
| Empty address shows 6 field errors | Pass | Pass |
| Invalid mobile and PIN rejected | Pass | Pass |
| Online payment shown as "coming soon" and disabled | Pass | Pass |
| WhatsApp message carries reference, items, total, address | Pass | Pass |
| Confirmation screen with order reference | Pass | Pass |
| Bag cleared, order saved on device | Pass | Pass |
| Order shows in My orders | Pass | Pass |
| Address saved and pre-filled next time | Pass | Pass |

## Shop, demo mode (`?demo=1`) linked to the dashboard

| Check | Result |
|---|---|
| Demo strip visible | Pass |
| Announcement set in dashboard shows in shop | Pass |
| Homepage collection set in dashboard leads Trending | Pass |
| Product added in dashboard appears with stock | Pass |
| Price edited in dashboard shows in shop | Pass |
| Coupon minimum enforced (FESTIVE300) | Pass |
| Coupon applied (WELCOME10, ₹498 off) | Pass |
| Simulated gateway shown, labelled as simulated | Pass |
| Paid order total computed from catalogue, not browser (₹4,482); stock 2 → 0 | Pass |
| New order visible in owner dashboard | Pass |
| Customer tracking shows owner's shipping update | Pass |
| Failed payment screen; stock released | Pass |

## Owner dashboard (`/admin/`)

| Check | Result |
|---|---|
| Login screen shown, app hidden before sign-in | Pass |
| App shown after sign-in | Pass |
| Ship without courier rejected; invalid tracking rejected | Pass |
| Order moved placed → delivered with 7-step audit trail | Pass |
| Return without reason rejected | Pass |
| Refund journey; stock 8 → 9 | Pass |
| Empty product rejected with field messages | Pass |
| Photo upload resized in browser | Pass |
| Product added with stock; duplicate SKU rejected | Pass |
| Bulk +10% price change | Pass |
| Excel export opens as a valid .xlsx | Pass |
| CSV import | Pass |
| Cannot remove more stock than held | Pass |
| Low-stock notification at threshold | Pass |
| WhatsApp campaign without opt-out text rejected | Pass |
| Campaign cannot be sent before approval | Pass |
| Campaign reaches only opted-in customers (49 of 49) | Pass |
| Short coupon code rejected; new coupon active | Pass |
| Assistant answers dispatch, description and weekly report | Pass |
| Invalid GSTIN rejected | Pass |
| Dashboard fits phone width | Pass |

## Manual checks before going live

- [ ] Every product: price, fabric, lengths, colours, care confirmed by the owner (`verified:true`)
- [ ] Policy pages reviewed by the owner (shipping, returns, privacy, terms); `[brackets]` filled
- [ ] WhatsApp order arrives on +91 99101 88555 from a real phone
- [ ] Product pages pass Google Rich Results Test
- [ ] Lighthouse mobile score checked on the live URL
- [ ] Payment sandbox: success, failure, duplicate webhook, refund (after gateway account)
- [ ] Shiprocket test shipment (after account)
