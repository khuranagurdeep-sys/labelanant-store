/* Label Anant DEMO data layer.
   Everything here is SAMPLE data saved in this browser only (localStorage). No real orders, payments,
   customers or messages are created. In production these functions move to a secure server
   (see docs/ARCHITECTURE.md); the shapes below match the planned database tables. */
(function () {
  "use strict";
  const KEY = "labelanant-demo-db-v1";
  const DAY = 864e5;
  const COLS = {wedding: "Wedding edit", festive: "Festive edit", embroidered: "Embroidered", banarasi: "Banarasi", velvet: "Velvet", printed: "Printed", kalamkari: "Kalamkari", everyday: "Everyday elegance"};
  const COLOURS = {rani: ["Rani pink", "#C2185B"], red: ["Red", "#C62828"], orange: ["Orange", "#EF6C00"], mustard: ["Mustard", "#E0A800"], green: ["Green", "#86A24E"], mint: ["Mint", "#9CCFB0"], teal: ["Teal", "#12808A"], sky: ["Sky blue", "#8EC9EA"], blush: ["Blush", "#F4B6C6"], coral: ["Coral", "#F28B82"], mauve: ["Mauve", "#A0566F"], purple: ["Purple", "#6A1B9A"], wine: ["Wine", "#7B1E3A"], black: ["Black", "#222222"], ivory: ["Ivory", "#EFE6D2"], peach: ["Peach", "#F6B98F"], navy: ["Navy", "#23305E"], lilac: ["Lilac", "#B8A2D6"], gold: ["Gold", "#C9A24E"]};
  const STATUS = {
    placed: "Awaiting payment", payment_verified: "Payment verified", confirmed: "Confirmed", processing: "Processing", packed: "Packed",
    shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", payment_failed: "Payment failed", return_requested: "Return requested",
    return_approved: "Return approved", returned: "Returned", refund_pending: "Refund pending", refunded: "Refunded"
  };
  // allowed transitions: the order workflow and the separate cancellation / return / refund flows
  const FLOW = {
    placed: ["payment_verified", "payment_failed", "cancelled"],
    payment_failed: ["placed", "cancelled"],
    payment_verified: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["packed", "cancelled"],
    packed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: ["return_requested"],
    return_requested: ["return_approved", "delivered"],
    return_approved: ["returned"],
    returned: ["refund_pending"],
    refund_pending: ["refunded"],
    cancelled: [], refunded: []
  };
  const PAID = ["payment_verified", "confirmed", "processing", "packed", "shipped", "delivered", "return_requested", "return_approved", "returned", "refund_pending", "refunded"];
  const STATES = ["Delhi", "Maharashtra", "Karnataka", "Rajasthan", "Uttar Pradesh", "Punjab", "Gujarat", "West Bengal", "Telangana", "Madhya Pradesh", "Uttarakhand", "Kerala", "Haryana", "Tamil Nadu", "Chandigarh"];
  const CITY = {"Delhi": "New Delhi", "Maharashtra": "Mumbai", "Karnataka": "Bengaluru", "Rajasthan": "Jaipur", "Uttar Pradesh": "Lucknow", "Punjab": "Ludhiana", "Gujarat": "Ahmedabad", "West Bengal": "Kolkata", "Telangana": "Hyderabad", "Madhya Pradesh": "Indore", "Uttarakhand": "Dehradun", "Kerala": "Kochi", "Haryana": "Gurugram", "Tamil Nadu": "Chennai", "Chandigarh": "Chandigarh"};

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const iso = t => new Date(t).toISOString();
  const pad = (n, w) => String(n).padStart(w, "0");

  function seed() {
    const r = rng(20261120), pick = a => a[Math.floor(r() * a.length)], int = (a, b) => a + Math.floor(r() * (b - a + 1));
    const now = Date.now();
    const db = {
      version: 1, demo: true, seededAt: iso(now),
      settings: {
        storeName: "Label Anant", whatsapp: "919910188555", address: "4/317, Nirankari Colony, Delhi 110009", email: "", gstin: "",
        lowStockDefault: 3, currency: "INR",
        announcements: ["Free shipping across India", "New arrivals: printed crepe and Kalamkari suits", "Order on WhatsApp · +91 99101 88555"],
        homeCollection: "wedding",
        policies: {
          shipping: "Free shipping across India. Dispatch time: [to be confirmed by Label Anant] working days. Delivery time depends on the courier and PIN code.",
          returns: "[To be decided by Label Anant: return or exchange window, condition of goods, whether unstitched fabric that has been cut can be returned, who pays return shipping.]",
          refunds: "[To be decided: refund method and timeline after the returned item is received and checked.]",
          cancellation: "[To be decided: until when an order can be cancelled, for example before dispatch.]",
          privacy: "[To be drafted with the business's legal adviser under the Digital Personal Data Protection Act, 2023: what data is collected, why, how long it is kept, and how customers can ask for it to be deleted.]",
          terms: "[To be drafted: seller's legal name and address, GSTIN, pricing and taxes, governing law, grievance officer contact as required by the Consumer Protection (E-Commerce) Rules, 2020.]",
          support: "WhatsApp and call: +91 99101 88555. Hours: [to be confirmed]."
        }
      },
      collections: [], products: [], customers: [], orders: [], ledger: [], coupons: [], campaigns: [], tickets: [],
      notifications: [], audit: [], abandoned: [], seq: {order: 10000, ledger: 0, ticket: 100, product: 200, campaign: 10, note: 0}
    };
    const colDefs = [["wedding", "Rani, red and gold for the big day"], ["festive", "Bright, celebratory suits for festivals"], ["embroidered", "Thread and zari work"], ["banarasi", "Woven Banarasi with zari"], ["velvet", "Rich velvet for winter evenings"], ["printed", "Light prints for day functions"], ["kalamkari", "Hand-block style Kalamkari prints"], ["everyday", "Easy suits for everyday wear"]];
    db.collections = colDefs.map(([id, desc], i) => ({id, name: COLS[id], desc, featured: i < 4, status: "published", real: ["wedding", "embroidered", "banarasi", "velvet", "printed"].includes(id)}));
    // real catalogue (prices are samples until verified)
    (window.LA_CATALOGUE || []).forEach((p, i) => {
      db.products.push(normalize({
        id: p.id, sku: p.id + "-" + (p.col[0] || "x").slice(0, 3).toUpperCase(), name: p.name, collections: p.cols.slice(), category: "Unstitched suit set",
        desc: p.desc, fabric: p.fab, colours: p.col.slice(), variants: p.vars ? p.vars.slice() : [], pattern: "", embroidery: "", components: "Unstitched kurta fabric, bottom fabric, dupatta (to be verified)",
        top: "", bottom: "", dupatta: "", occasions: p.occ.slice(), care: "Dry clean", price: p.price, mrp: null, gst: null,
        stock: null, threshold: 3, status: "published", launchAt: null, images: (p.pics || [p.f, p.f + "-d"]).map(n => "img/" + n + ".jpg"),
        video: "", shipping: "Free shipping across India", returnable: null, seoTitle: "", seoDesc: "", tags: p.tag ? [p.tag] : [], related: [],
        real: true, verified: false, f: p.f, tag: p.tag, n: p.n, createdAt: iso(now - (40 - p.n * 2) * DAY), placeholder: null
      }));
    });
    // fictional demo products to reach 40
    const demoNames = [["Ivory Chanderi Suit", "everyday", "ivory", "Chanderi"], ["Peach Mul Cotton Suit", "everyday", "peach", "Mul cotton"], ["Navy Bandhani Suit", "festive", "navy", "Bandhani"], ["Lilac Organza Suit", "festive", "lilac", "Organza"], ["Gold Tissue Suit", "wedding", "gold", "Tissue"], ["Teal Kalamkari Cotton Suit", "kalamkari", "teal", "Cotton"],
      ["Mustard Kalamkari Suit", "kalamkari", "mustard", "Cotton"], ["Rani Gota Patti Suit", "festive", "rani", "Georgette"], ["Black Chikankari Suit", "embroidered", "black", "Georgette"], ["Wine Banarasi Silk Suit", "banarasi", "wine", "Banarasi silk"], ["Sky Cotton Floral Suit", "everyday", "sky", "Cotton"], ["Coral Mirror Work Suit", "festive", "coral", "Georgette"],
      ["Green Velvet Embroidered Suit", "velvet", "green", "Velvet"], ["Red Bridal Banarasi Suit", "wedding", "red", "Banarasi silk"], ["Mint Lucknowi Suit", "embroidered", "mint", "Georgette"], ["Purple Kalamkari Silk Suit", "kalamkari", "purple", "Silk"], ["Blush Organza Floral Suit", "wedding", "blush", "Organza"], ["Orange Leheriya Suit", "festive", "orange", "Cotton"],
      ["Mauve Everyday Cotton Suit", "everyday", "mauve", "Cotton"], ["Navy Velvet Zari Suit", "velvet", "navy", "Velvet"], ["Ivory Gold Tissue Suit", "wedding", "ivory", "Tissue"], ["Teal Printed Muslin Suit", "printed", "teal", "Muslin"], ["Peach Printed Crepe Suit", "printed", "peach", "Crepe"]];
    demoNames.forEach(([nm, col, colour, fab], i) => {
      const id = "DM-" + (201 + i);
      db.products.push(normalize({
        id, sku: id + "-" + colour.slice(0, 3).toUpperCase(), name: "Demo · " + nm, collections: [col], category: "Unstitched suit set",
        desc: "Fictional demo product for testing the dashboard. Not for sale.", fabric: fab, colours: [colour], variants: [], pattern: pick(["Floral", "Paisley", "Geometric", "Solid", "Buti"]), embroidery: pick(["", "Zari yoke", "Thread work", "Gota patti", ""]),
        components: "Kurta fabric 2.5 m, bottom fabric 2.5 m, dupatta 2.25 m (demo values)", top: "2.5 m (demo)", bottom: "2.5 m (demo)", dupatta: "2.25 m (demo)",
        occasions: [pick(["wedding", "haldi", "mehendi", "sangeet", "reception", "cocktail"])], care: "Dry clean", price: pick([1650, 1850, 2150, 2450, 2750, 2950, 3250, 3650, 3950, 4450, 4950]), mrp: null, gst: 5,
        stock: null, threshold: 3, status: i === 21 ? "draft" : i === 22 ? "scheduled" : "published", launchAt: i === 22 ? iso(now + 5 * DAY) : null, images: [], video: "",
        shipping: "Free shipping across India", returnable: true, seoTitle: "", seoDesc: "", tags: ["Demo"], related: [], real: false, verified: false,
        f: null, tag: "", n: 0, createdAt: iso(now - int(5, 70) * DAY), placeholder: COLOURS[colour][1]
      }));
    });
    // customers
    const first = ["Aanya", "Aditi", "Ananya", "Anjali", "Bhavna", "Deepika", "Divya", "Gurleen", "Harpreet", "Ishita", "Jasmine", "Kavya", "Komal", "Kritika", "Manpreet", "Meera", "Neha", "Nidhi", "Pooja", "Priya", "Radhika", "Ritu", "Riya", "Sakshi", "Simran", "Sneha", "Swati", "Tanvi", "Vaishali", "Yashika"];
    const last = ["Arora", "Bansal", "Chawla", "Dhillon", "Gill", "Gupta", "Jain", "Kapoor", "Kaur", "Khanna", "Malhotra", "Mehta", "Nair", "Reddy", "Sethi", "Sharma", "Singh", "Verma", "Bhatia", "Saxena"];
    for (let i = 0; i < 100; i++) {
      const fn = pick(first), ln = pick(last), st = pick(STATES), joined = now - int(1, 120) * DAY;
      db.customers.push({id: "C" + (1001 + i), name: fn + " " + ln, phone: "90000" + pad(10001 + i, 5).slice(-5), email: (fn + "." + ln + (i + 1)).toLowerCase() + "@example.com",
        city: CITY[st], state: st, createdAt: iso(joined), consent: {whatsapp: r() < .55, email: r() < .4, at: iso(joined)},
        addresses: [{line: int(1, 300) + ", Sample Street " + int(1, 40), city: CITY[st], state: st, pin: String(int(110001, 799999))}], notes: "", demo: true});
    }
    // inventory: current stock first, opening balances back-filled after orders
    db.products.forEach(p => { p.stock = p.status === "draft" ? 0 : pick([0, 1, 2, 3, 4, 6, 8, 10, 12, 15]); });
    db.products.forEach(p => { if (p.id === "LA-116") p.stock = 2; if (p.id === "LA-113") p.stock = 9; });
    const sold = {};
    // orders
    const plan = [].concat(Array(22).fill("delivered"), Array(6).fill("shipped"), Array(3).fill("packed"), Array(3).fill("processing"), Array(3).fill("confirmed"), Array(2).fill("payment_verified"),
      Array(4).fill("placed"), Array(2).fill("payment_failed"), Array(2).fill("cancelled"), ["return_requested", "refund_pending", "refunded"]);
    const order = ["placed", "payment_verified", "confirmed", "processing", "packed", "shipped", "delivered"];
    const sellable = db.products.filter(p => p.status === "published");
    plan.forEach((target, i) => {
      const c = db.customers[Math.floor(r() * 60)];
      const created = target === "placed" || target === "payment_verified" ? now - int(0, 1) * DAY - int(1, 20) * 36e5
        : ["confirmed", "processing"].includes(target) ? now - int(1, 3) * DAY : ["packed", "shipped"].includes(target) ? now - int(2, 7) * DAY : now - int(6, 58) * DAY;
      const items = []; const k = r() < .7 ? 1 : 2;
      for (let j = 0; j < k; j++) { const p = pick(sellable); if (!items.find(x => x.pid === p.id)) items.push({pid: p.id, name: p.name, sku: p.sku, qty: r() < .85 ? 1 : 2, price: p.price, variant: p.variants[0] || ""}); }
      const subtotal = items.reduce((s, x) => s + x.qty * x.price, 0);
      const coupon = r() < .2 ? "WELCOME10" : "";
      const discount = coupon ? Math.round(subtotal * .1) : 0;
      const method = target === "placed" ? "UPI" : pick(["UPI", "UPI", "UPI", "Card", "Net banking", "UPI"]);
      const id = "LA-O-" + (++db.seq.order);
      const o = {id, key: id, customerId: c.id, customerName: c.name, phone: c.phone, items, subtotal, discount, coupon, shipping: 0, total: subtotal - discount,
        gstNote: "GST rate to be configured", payment: {method, status: "pending", ref: "", at: null, gateway: "demo"}, status: "placed", createdAt: iso(created),
        address: Object.assign({name: c.name}, c.addresses[0]), courier: "", tracking: "", notes: [], history: [{at: iso(created), from: null, to: "placed", by: "Customer", note: "Order placed on website (demo)"}], refund: null, returnReason: "", demo: true};
      let t = created;
      const step = (to, by, note, gap) => { t += gap; o.history.push({at: iso(Math.min(t, now - 6e5)), from: o.status, to, by, note: note || ""}); o.status = to; };
      if (target === "payment_failed") { step("payment_failed", "Payment gateway (demo)", "Payment declined by bank (simulated)", 6e5); o.payment.status = "failed"; }
      else if (target === "cancelled") { step("payment_verified", "Payment gateway (demo)", "", 3e5); verifyPay(o, r, t); step("cancelled", "Owner", "Customer asked to cancel before dispatch", 5 * 36e5); o.payment.status = "refunded"; o.refund = {amount: o.total, status: "refunded", ref: "DEMO-RF-" + (5000 + i), at: iso(t)}; }
      else if (target !== "placed") {
        const goal = ["return_requested", "refund_pending", "refunded"].includes(target) ? "delivered" : target;
        const gi = order.indexOf(goal);
        for (let s = 1; s <= gi; s++) {
          const to = order[s];
          step(to, s === 1 ? "Payment gateway (demo)" : "Owner", to === "shipped" ? "Handed to courier" : "", s === 1 ? 3e5 : s === 6 ? int(2, 5) * DAY : int(3, 20) * 36e5);
          if (to === "payment_verified") verifyPay(o, r, t);
          if (to === "shipped") { o.courier = pick(["Delhivery", "Blue Dart", "DTDC", "Xpressbees"]); o.tracking = "DEMO" + int(100000000, 999999999); }
        }
        if (target === "return_requested") { o.returnReason = "Colour looks different from the photo"; step("return_requested", "Customer", o.returnReason, DAY); }
        if (target === "refund_pending" || target === "refunded") {
          o.returnReason = "Dupatta border had a pulled thread"; step("return_requested", "Customer", o.returnReason, DAY); step("return_approved", "Owner", "Eligible for return", 5 * 36e5);
          step("returned", "Owner", "Item received and checked", 3 * DAY); step("refund_pending", "Owner", "", 36e5);
          o.refund = {amount: o.total, status: "pending", ref: "", at: null};
          if (target === "refunded") { step("refunded", "Payment gateway (demo)", "Refund processed (simulated)", DAY); o.refund = {amount: o.total, status: "refunded", ref: "DEMO-RF-" + (6000 + i), at: iso(t)}; o.payment.status = "refunded"; }
        }
      }
      if (!["payment_failed", "cancelled"].includes(o.status)) items.forEach(x => { sold[x.pid] = (sold[x.pid] || 0) + x.qty; db.ledger.push({id: ++db.seq.ledger, at: o.createdAt, pid: x.pid, change: -x.qty, reason: "Order " + id, ref: id, by: "System"}); });
      if (["returned", "refund_pending", "refunded"].includes(o.status)) items.forEach(x => { sold[x.pid] -= x.qty; db.ledger.push({id: ++db.seq.ledger, at: o.history.find(h => h.to === "returned").at, pid: x.pid, change: x.qty, reason: "Return received " + id, ref: id, by: "Owner"}); });
      db.orders.push(o);
    });
    db.products.forEach(p => { db.ledger.push({id: ++db.seq.ledger, at: iso(now - 80 * DAY), pid: p.id, change: p.stock + (sold[p.id] || 0), reason: "Opening stock (demo)", ref: "", by: "System"}); });
    db.ledger.sort((a, b) => a.at < b.at ? -1 : 1);
    db.coupons = [
      {code: "WELCOME10", type: "percent", value: 10, minOrder: 2000, expires: iso(now + 60 * DAY), limit: 500, used: db.orders.filter(o => o.coupon === "WELCOME10").length, active: true, note: "First order offer (demo)"},
      {code: "FESTIVE300", type: "flat", value: 300, minOrder: 2500, expires: iso(now + 20 * DAY), limit: 200, used: 0, active: true, note: "Festive offer (demo)"},
      {code: "DIWALI15", type: "percent", value: 15, minOrder: 3000, expires: iso(now - 10 * DAY), limit: 100, used: 0, active: false, note: "Expired (demo)"}];
    const optedWA = db.customers.filter(c => c.consent.whatsapp).length;
    db.campaigns = [
      {id: "CP-11", name: "Velvet nights launch", channel: "WhatsApp", segment: "whatsapp", message: "New velvet suits for winter weddings are here. Reply STOP to opt out.", status: "sent", createdAt: iso(now - 20 * DAY), approvedBy: "Owner", approvedAt: iso(now - 19 * DAY), sentAt: iso(now - 19 * DAY), recipients: optedWA, delivered: optedWA - 2, clicks: 18, orders: 4, revenue: 13450, demo: true},
      {id: "CP-12", name: "Wedding edit email", channel: "Email", segment: "highvalue", message: "Our wedding edit: embroidered yokes and woven dupattas.", status: "approved", createdAt: iso(now - 3 * DAY), approvedBy: "Owner", approvedAt: iso(now - 2 * DAY), sentAt: null, recipients: 0, delivered: 0, clicks: 0, orders: 0, revenue: 0, demo: true},
      {id: "CP-13", name: "Checkout reminder", channel: "WhatsApp", segment: "abandoned", message: "You left a suit in your bag. Need help choosing? Reply here.", status: "draft", createdAt: iso(now - DAY), approvedBy: "", approvedAt: null, sentAt: null, recipients: 0, delivered: 0, clicks: 0, orders: 0, revenue: 0, demo: true}];
    db.seq.campaign = 13;
    const subj = [["Colour slightly different from photo", "open"], ["When will my order ship?", "open"], ["Need dupatta length details", "resolved"], ["Wrong PIN code entered", "resolved"], ["Parcel delayed in transit", "open"], ["Want to exchange for another colour", "resolved"]];
    subj.forEach(([s, st], i) => { const o = db.orders[i * 5 + 2]; db.tickets.push({id: "T-" + (++db.seq.ticket), customerId: o.customerId, orderId: o.id, subject: s, status: st, createdAt: iso(now - int(0, 9) * DAY), messages: [{at: iso(now - int(0, 9) * DAY), by: "Customer", text: s}], demo: true}); });
    for (let i = 0; i < 8; i++) { const c = db.customers[60 + i * 4]; const p = pick(sellable); db.abandoned.push({customerId: c.id, at: iso(now - int(0, 6) * DAY), items: [{pid: p.id, name: p.name, qty: 1, price: p.price}], consent: c.consent.whatsapp}); }
    db.products.forEach(p => lowCheck(db, p));
    db.audit.push({at: iso(now), user: "System", action: "Demo data created", ref: ""});
    return db;
  }
  function verifyPay(o, r, t) { o.payment.status = "verified"; o.payment.at = iso(t); o.payment.ref = (o.payment.method === "UPI" ? "DEMO-UPI-" : "DEMO-PAY-") + Math.floor(r() * 9e8 + 1e8); }
  function normalize(p) { return p; }
  function lowCheck(db, p) {
    if (p.stock == null || p.status !== "published") return;
    const t = p.threshold == null ? db.settings.lowStockDefault : p.threshold;
    if (p.stock <= t) {
      const text = p.stock === 0 ? `${p.name} (${p.id}) is out of stock` : `${p.name} (${p.id}) is low: ${p.stock} left`;
      if (!db.notifications.find(n => n.pid === p.id && !n.read && n.stock === p.stock)) db.notifications.unshift({id: "N" + Date.now() + Math.floor(Math.random() * 999), at: iso(Date.now()), type: p.stock === 0 ? "out_of_stock" : "low_stock", pid: p.id, stock: p.stock, text, read: false});
    }
  }

  /* ---------- persistence ---------- */
  function load() {
    try { const s = localStorage.getItem(KEY); if (s) { const db = JSON.parse(s); if (db && db.version === 1) return db; } } catch (e) {}
    const db = seed(); save(db); return db;
  }
  function save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} return load(); }
  function log(db, user, action, ref) { db.audit.unshift({at: iso(Date.now()), user, action, ref: ref || ""}); if (db.audit.length > 500) db.audit.length = 500; }

  /* ---------- catalogue helpers ---------- */
  const product = (db, id) => db.products.find(p => p.id === id);
  function visibleProducts(db) { const now = Date.now(); return db.products.filter(p => p.status === "published" || (p.status === "scheduled" && p.launchAt && Date.parse(p.launchAt) <= now)); }
  function adjustStock(db, pid, change, reason, by, ref) {
    const p = product(db, pid); if (!p) throw new Error("Product not found");
    change = Math.trunc(Number(change));
    if (!change) throw new Error("Enter a quantity other than zero");
    if ((p.stock || 0) + change < 0) throw new Error(`Only ${p.stock || 0} in stock; cannot remove ${-change}`);
    p.stock = (p.stock || 0) + change;
    db.ledger.push({id: ++db.seq.ledger, at: iso(Date.now()), pid, change, reason, ref: ref || "", by: by || "Owner"});
    lowCheck(db, p); return p.stock;
  }
  function stockOf(db, pid) { return db.ledger.filter(l => l.pid === pid).reduce((s, l) => s + l.change, 0); }

  /* ---------- coupons ---------- */
  function checkCoupon(db, code, subtotal) {
    code = String(code || "").trim().toUpperCase();
    if (!code) return {ok: false, msg: "Enter a coupon code"};
    const c = db.coupons.find(x => x.code === code);
    if (!c) return {ok: false, msg: "This code is not valid"};
    if (!c.active) return {ok: false, msg: "This code is no longer active"};
    if (c.expires && Date.parse(c.expires) < Date.now()) return {ok: false, msg: "This code has expired"};
    if (c.limit && c.used >= c.limit) return {ok: false, msg: "This code has reached its usage limit"};
    if (subtotal < (c.minOrder || 0)) return {ok: false, msg: `Add items worth ₹${(c.minOrder - subtotal).toLocaleString("en-IN")} more to use ${code}`};
    const discount = c.type === "percent" ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
    return {ok: true, code, discount, msg: `${code} applied: you save ₹${discount.toLocaleString("en-IN")}`};
  }

  /* ---------- orders (would run on the server in production) ---------- */
  function placeOrder(db, req) {
    // req: {key, customer:{name, phone, email}, address:{line, city, state, pin}, items:[{pid, qty, variant}], coupon, method, consent:{whatsapp}}
    if (!req.items || !req.items.length) throw new Error("Your bag is empty");
    if (!/^[6-9]\d{9}$/.test(String(req.customer.phone || "").replace(/\D/g, "").slice(-10))) throw new Error("Enter a valid 10-digit Indian mobile number");
    if (!/^\d{6}$/.test(String(req.address.pin || ""))) throw new Error("Enter a valid 6-digit PIN code");
    const dup = db.orders.find(o => o.key === req.key && Date.now() - Date.parse(o.createdAt) < 10 * 6e4);
    if (dup) return dup;                                   // duplicate-order prevention
    const items = req.items.map(x => {
      const p = product(db, x.pid);
      if (!p || !visibleProducts(db).includes(p)) throw new Error("A suit in your bag is no longer available");
      const qty = Math.max(1, Math.min(10, Math.trunc(x.qty)));
      if (p.stock != null && p.stock < qty) throw new Error(`Only ${p.stock} left of ${p.name}`);
      return {pid: p.id, name: p.name, sku: p.sku, qty, price: p.price, variant: x.variant || ""}; // price taken from catalogue, never from the browser
    });
    const subtotal = items.reduce((s, x) => s + x.qty * x.price, 0);
    let discount = 0, coupon = "";
    if (req.coupon) { const c = checkCoupon(db, req.coupon, subtotal); if (!c.ok) throw new Error(c.msg); discount = c.discount; coupon = c.code; }
    const phone = String(req.customer.phone).replace(/\D/g, "").slice(-10);
    let cust = db.customers.find(c => c.phone === phone);
    if (!cust) { cust = {id: "C" + (1001 + db.customers.length), name: req.customer.name, phone, email: req.customer.email || "", city: req.address.city, state: req.address.state, createdAt: iso(Date.now()), consent: {whatsapp: !!(req.consent && req.consent.whatsapp), email: false, at: iso(Date.now())}, addresses: [], notes: "", demo: true}; db.customers.push(cust); }
    else if (req.consent && req.consent.whatsapp) cust.consent.whatsapp = true;
    if (!cust.addresses.find(a => a.line === req.address.line && a.pin === req.address.pin)) cust.addresses.unshift(Object.assign({}, req.address));
    const id = "LA-O-" + (++db.seq.order), now = iso(Date.now());
    const o = {id, key: req.key, customerId: cust.id, customerName: req.customer.name, phone, items, subtotal, discount, coupon, shipping: 0, total: subtotal - discount, gstNote: "GST rate to be configured",
      payment: {method: req.method, status: "pending", ref: "", at: null, gateway: "demo"}, status: "placed", createdAt: now, address: Object.assign({name: req.customer.name}, req.address),
      courier: "", tracking: "", notes: [], history: [{at: now, from: null, to: "placed", by: "Customer", note: "Order placed on website (demo)"}], refund: null, returnReason: "", demo: true};
    items.forEach(x => adjustStock(db, x.pid, -x.qty, "Reserved for " + id, "System", id));   // reserve stock to prevent overselling
    if (coupon) db.coupons.find(c => c.code === coupon).used++;
    db.orders.unshift(o); log(db, "Customer", "Placed order", id);
    return o;
  }
  function paymentResult(db, id, ok) {   // simulates the gateway webhook after signature verification
    const o = db.orders.find(x => x.id === id); if (!o) throw new Error("Order not found");
    if (o.status !== "placed") return o;
    if (ok) { o.payment.status = "verified"; o.payment.at = iso(Date.now()); o.payment.ref = "DEMO-PAY-" + Math.floor(Math.random() * 9e8 + 1e8); move(db, id, "payment_verified", "Payment gateway (demo)", "Payment verified (simulated webhook)"); }
    else { o.payment.status = "failed"; move(db, id, "payment_failed", "Payment gateway (demo)", "Payment failed (simulated)"); o.items.forEach(x => adjustStock(db, x.pid, x.qty, "Released: payment failed " + id, "System", id)); }
    return o;
  }
  function move(db, id, to, by, note, extra) {
    const o = db.orders.find(x => x.id === id); if (!o) throw new Error("Order not found");
    if (!(FLOW[o.status] || []).includes(to)) throw new Error(`Cannot change an order from "${STATUS[o.status]}" to "${STATUS[to]}"`);
    if (to === "shipped") { if (!extra || !extra.courier || !extra.tracking) throw new Error("Enter the courier and tracking number"); o.courier = extra.courier; o.tracking = extra.tracking; }
    if (to === "payment_verified" && by !== "Payment gateway (demo)") { o.payment.status = "verified"; o.payment.at = iso(Date.now()); o.payment.ref = (extra && extra.ref) || "MANUAL-" + Date.now().toString().slice(-6); }
    if (to === "placed" && o.status === "payment_failed") o.items.forEach(x => adjustStock(db, x.pid, -x.qty, "Reserved again for " + id, "System", id));
    if (to === "cancelled") {
      if (o.status !== "payment_failed") o.items.forEach(x => adjustStock(db, x.pid, x.qty, "Released: cancelled " + id, by, id));
      if (o.payment.status === "verified") o.refund = {amount: o.total, status: "pending", ref: "", at: null};
    }
    if (to === "returned") o.items.forEach(x => adjustStock(db, x.pid, x.qty, "Return received " + id, by, id));
    if (to === "refund_pending" && !o.refund) o.refund = {amount: o.total, status: "pending", ref: "", at: null};
    if (to === "refunded") { o.refund = {amount: (o.refund && o.refund.amount) || o.total, status: "refunded", ref: "DEMO-RF-" + Date.now().toString().slice(-6), at: iso(Date.now())}; o.payment.status = "refunded"; }
    if (to === "return_requested" && extra && extra.reason) o.returnReason = extra.reason;
    o.history.push({at: iso(Date.now()), from: o.status, to, by, note: note || ""});
    o.status = to; log(db, by, `Order ${STATUS[to]}`, id);
    return o;
  }
  function refundCancelled(db, id, by) { const o = db.orders.find(x => x.id === id); if (!o || o.status !== "cancelled" || !o.refund || o.refund.status !== "pending") throw new Error("No pending refund on this order"); o.refund.status = "refunded"; o.refund.ref = "DEMO-RF-" + Date.now().toString().slice(-6); o.refund.at = iso(Date.now()); o.payment.status = "refunded"; o.history.push({at: iso(Date.now()), from: "cancelled", to: "cancelled", by, note: "Refund processed (simulated)"}); log(db, by, "Refund processed", id); return o; }

  /* ---------- reporting ---------- */
  const paidOrders = db => db.orders.filter(o => PAID.includes(o.status));
  function inRange(t, range) { const d = Date.now() - Date.parse(t); return range === "all" ? true : range === "today" ? new Date(t).toDateString() === new Date().toDateString() : d <= ({"7d": 7, "30d": 30, "90d": 90}[range] || 30) * DAY; }
  function segmentOf(db, c) {
    const os = paidOrders(db).filter(o => o.customerId === c.id), value = os.reduce((s, o) => s + o.total, 0);
    const last = os.length ? Math.max(...os.map(o => Date.parse(o.createdAt))) : null;
    const tags = [];
    if (Date.now() - Date.parse(c.createdAt) <= 30 * DAY) tags.push("new");
    if (os.length >= 2) tags.push("repeat");
    if (value >= 6000) tags.push("highvalue");
    if (last && Date.now() - last > 45 * DAY) tags.push("lapsed");
    if (c.consent.whatsapp) tags.push("whatsapp");
    if (db.abandoned.find(a => a.customerId === c.id && a.consent)) tags.push("abandoned");
    return {orders: os.length, value, last, tags};
  }
  const SEGMENTS = {new: "New customers (30 days)", repeat: "Repeat customers", highvalue: "High value (₹6,000+)", lapsed: "Not ordered in 45 days", whatsapp: "WhatsApp opted in", abandoned: "Abandoned checkout (consented)"};
  function audience(db, seg) { return db.customers.filter(c => segmentOf(db, c).tags.includes(seg)).filter(c => seg === "abandoned" || seg === "whatsapp" ? c.consent.whatsapp : true); }

  window.LA_DEMO = {KEY, COLS, COLOURS, STATUS, FLOW, PAID, STATES, SEGMENTS, load, save, reset, seed, log, product, visibleProducts, adjustStock, stockOf, checkCoupon, placeOrder, paymentResult, move, refundCancelled, paidOrders, inRange, segmentOf, audience, lowCheck, DAY};
})();
