/* Local-only stand-in for the house API.

   The real service (talkerstein-consulting/amazingdonuts,
   apps/house-accounts) refuses to boot without Square credentials and a
   PostgreSQL database — which keeps every secret off this machine, and
   also keeps /checkout stuck on "the checkout service is not answering",
   which hides three of its four steps. This serves just enough of
   /api/storefront/* for every state of the checkout and the desk to be
   designed and walked: accounts made and signed into, addresses kept,
   a quote that totals the bag with tax by country, an order placed, and
   an order history that grows.

   Nothing here talks to Square. `applicationId` is deliberately absent and
   `testMode` is true, so the card field draws a local stand-in and no real
   card can be entered. Everything lives in memory and is gone on restart.

   Run:   node scripts/mock-house-api.mjs          (port 3101)
   Then:  npm run dev                               (next.config proxies /api/house here)

   Codes: ARIA10 takes ten percent off. Any password of eight characters
   makes an account. */
import { createServer } from "node:http";
import { randomUUID, createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3101;

/* Prices from the catalogue the site itself sells from, keyed the way the
   checkout names a line: `House — Colourway`. Read rather than imported so
   this file stays plain Node with no TypeScript loader. */
const catalogueSource = readFileSync(join(here, "../src/lib/catalogue.ts"), "utf8");
const navSource = readFileSync(join(here, "../src/lib/navigation.ts"), "utf8");
const houseNames = new Map(
  [...navSource.matchAll(/slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]),
);
const PRICES = new Map();
for (const block of catalogueSource.matchAll(/"([\w-]+)":\s*\[([\s\S]*?)\n\s*\]/g)) {
  const [, slug, body] = block;
  for (const line of body.matchAll(/colorway:\s*"([^"]+)"[^}]*cents:\s*(\d+)/g)) {
    PRICES.set(`${houseNames.get(slug) ?? slug} — ${line[1]}`.toLowerCase(), Number(line[2]));
  }
}

/* ── state ── */
const users = new Map(); // email -> user
const sessions = new Map(); // token -> email
const profiles = new Map(); // email -> { phone, address }
const addressBook = new Map(); // email -> SavedAddress[]
const cards = new Map(); // email -> card
const orders = []; // newest first
const idempotent = new Map();

const TAX = { CA: 0.13, US: 0, GB: 0.2, DE: 0.19, FR: 0.2, IT: 0.22, ES: 0.21, NL: 0.21, AU: 0.1, JP: 0.1 };

const hash = (s) => createHash("sha256").update(s).digest("hex");
const publicUser = (u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || null });

const quote = (body) => {
  const subtotal = (body.items || []).reduce(
    (t, item) => t + (item.unitCents ?? PRICES.get(String(item.name).toLowerCase()) ?? 0) * (item.quantity ?? 1),
    0,
  );
  const discount = String(body.promoCode || "").toUpperCase() === "ARIA10" ? Math.round(subtotal * 0.1) : 0;
  const country = body.fulfillment?.address?.country || "US";
  const rate = TAX[country] ?? 0;
  const tax = Math.round((subtotal - discount) * rate);
  return {
    order: {
      currency: "USD",
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax,
      taxes: rate ? [{ name: country === "CA" ? "HST" : "VAT", percentage: String(rate * 100) }] : [],
    },
  };
};

const json = (res, status, body, headers = {}) => {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
};
const noContent = (res, headers = {}) => {
  res.writeHead(204, headers);
  res.end();
};
const cookieOf = (req) => {
  const m = /(?:^|;\s*)house_session=([^;]+)/.exec(req.headers.cookie || "");
  return m ? m[1] : null;
};
const setCookie = (token) => ({ "Set-Cookie": `house_session=${token}; Path=/; HttpOnly; SameSite=Lax` });
const clearCookie = () => ({ "Set-Cookie": "house_session=; Path=/; HttpOnly; Max-Age=0" });

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname.replace(/^\/api/, "");
  const token = cookieOf(req);
  const email = token && sessions.get(token);
  const user = email ? users.get(email) : null;
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return json(res, 400, { error: { message: "Bad JSON." } });
    }
    const need = () => (user ? null : json(res, 401, { error: { message: "Sign in first." } }));

    /* auth */
    if (path === "/auth/login" && req.method === "POST") {
      const u = users.get(String(body.email || "").toLowerCase());
      if (!u || u.passwordHash !== hash(String(body.password || "")))
        return json(res, 401, { error: { message: "Email or password is incorrect." } });
      const t = randomUUID();
      sessions.set(t, u.email);
      return json(res, 200, { user: publicUser(u) }, setCookie(t));
    }
    if (path === "/storefront/register" && req.method === "POST") {
      const e = String(body.email || "").toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return json(res, 400, { error: { message: "An email address." } });
      if (users.has(e)) return json(res, 409, { error: { message: "An account already exists for this email. Please sign in." } });
      if (String(body.password || "").length < 8) return json(res, 400, { error: { message: "A password of at least eight characters." } });
      const u = { id: randomUUID(), email: e, firstName: body.firstName, lastName: body.lastName, phone: body.phone || null, passwordHash: hash(body.password) };
      users.set(e, u);
      profiles.set(e, { phone: body.phone || "", address: null });
      addressBook.set(e, []);
      /* Guest orders placed with this address join the account. */
      for (const o of orders) if (o.guestEmail === e) o.userEmail = e;
      const t = randomUUID();
      sessions.set(t, e);
      return json(res, 201, { user: publicUser(u) }, setCookie(t));
    }
    if (path === "/auth/logout" && req.method === "POST") {
      if (token) sessions.delete(token);
      return noContent(res, clearCookie());
    }
    if (path === "/auth/forgot-password" && req.method === "POST")
      return json(res, 200, { ok: true, message: "If an account exists for that address, a reset link has been sent. (Local preview: nothing is sent.)" });
    if (path === "/auth/reset-password" && req.method === "POST")
      return json(res, 400, { error: { message: "This password reset link is invalid or has expired." } });

    /* session + config */
    if (path === "/storefront/session") {
      if (!user) return json(res, 200, { user: null, profile: null, houseAccount: null });
      const p = profiles.get(email);
      const card = cards.get(email);
      return json(res, 200, {
        user: publicUser(user),
        profile: { default_phone: p.phone || null, default_address: p.address },
        houseAccount: card ? { id: `ha-${user.id}`, status: "active", card, cardNeedsReplacement: false } : null,
      });
    }
    if (path === "/storefront/config")
      return json(res, 200, { environment: "sandbox", currency: "USD", placesEnabled: false, testMode: true });

    /* profile */
    if (path === "/storefront/profile" && req.method === "PATCH") {
      if (need()) return;
      user.firstName = body.firstName || user.firstName;
      user.lastName = body.lastName || user.lastName;
      user.phone = body.phone || null;
      profiles.set(email, { phone: body.phone || "", address: body.address || profiles.get(email).address });
      return json(res, 200, { ok: true });
    }
    if (path === "/storefront/account" && req.method === "DELETE") {
      if (need()) return;
      if (body.confirmation !== "DELETE") return json(res, 400, { error: { message: "Type DELETE to confirm." } });
      users.delete(email);
      profiles.delete(email);
      addressBook.delete(email);
      cards.delete(email);
      sessions.delete(token);
      return noContent(res, clearCookie());
    }

    /* addresses */
    if (path === "/storefront/addresses" && req.method === "GET") {
      if (need()) return;
      return json(res, 200, { addresses: addressBook.get(email) });
    }
    if (path === "/storefront/addresses" && req.method === "POST") {
      if (need()) return;
      const list = addressBook.get(email);
      if (list.length >= 10) return json(res, 409, { error: { message: "You can save up to ten addresses." } });
      if (body.isDefault || !list.length) for (const a of list) a.isDefault = false;
      const address = { id: `addr-${randomUUID().slice(0, 8)}`, ...body, isDefault: Boolean(body.isDefault) || !list.length };
      list.push(address);
      return json(res, 201, { address });
    }
    const one = path.match(/^\/storefront\/addresses\/([^/]+)$/);
    if (one && (req.method === "PATCH" || req.method === "DELETE")) {
      if (need()) return;
      const list = addressBook.get(email);
      const i = list.findIndex((a) => a.id === one[1]);
      if (i < 0) return json(res, 404, { error: { message: "Address not found." } });
      if (req.method === "PATCH") {
        if (body.isDefault) for (const a of list) a.isDefault = false;
        list[i] = { ...list[i], ...body };
        return json(res, 200, { address: list[i] });
      }
      const [removed] = list.splice(i, 1);
      if (removed.isDefault && list[0]) list[0].isDefault = true;
      return noContent(res);
    }

    /* card on file */
    if (path === "/storefront/house-card" && req.method === "POST") {
      if (need()) return;
      cards.set(email, { brand: "Visa", last4: "4242", expMonth: 12, expYear: 2030 });
      return json(res, 200, { ok: true });
    }

    /* promo, quote, checkout */
    if (path === "/public/storefront/promo-code") {
      const code = String(body.code || "").toUpperCase();
      return code === "ARIA10"
        ? json(res, 200, { valid: true, code, name: "Ten percent, for the preview" })
        : json(res, 200, { valid: false, code: "", name: "" });
    }
    if (path.endsWith("/storefront/quote")) {
      if (body.promoCode && String(body.promoCode).toUpperCase() !== "ARIA10")
        return json(res, 400, { error: { message: "That code is not one the house knows." } });
      return json(res, 200, quote(body));
    }
    if (path.endsWith("/storefront/checkout") && req.method === "POST") {
      const guest = path.startsWith("/public/");
      if (!guest && need()) return;
      if (!Array.isArray(body.items) || !body.items.length)
        return json(res, 400, { error: { message: "Add something to the bag first." } });
      if (!body.sourceId) return json(res, 400, { error: { message: "Card authorization is required." } });
      if (body.sourceId === "DECLINE")
        return json(res, 402, { error: { message: "The card was declined. Try another card, or contact the bank." } });
      if (!body.fulfillment?.address?.addressLine1)
        return json(res, 400, { error: { message: "An address is needed before the order can be placed." } });
      const previous = idempotent.get(body.idempotencyKey);
      if (previous) return json(res, 201, { order: previous });
      const priced = quote(body).order;
      const id = `AN-${Date.now().toString(36).toUpperCase()}${(orders.length + 1).toString().padStart(2, "0")}`;
      const order = {
        id,
        square_order_id: id,
        ordered_at: new Date().toISOString(),
        status: "completed",
        currency: "USD",
        subtotal: priced.subtotal,
        tax: priced.tax,
        total: priced.total,
        paymentStatus: "Paid",
        fulfillmentStatus: "Received by the workshop",
        fulfillment: { ...body.fulfillment, carrier: "DHL Express", trackingNumber: null, trackingUrl: null },
        breakdown: { merchandise: priced.subtotal, discount: priced.discount, deliveryFee: 0, tip: 0, tax: priced.tax, total: priced.total },
        line_items: body.items.map((item, i) => ({
          uid: `${id}-${i}`,
          name: item.name,
          quantity: String(item.quantity),
          total_money: { amount: (item.unitCents ?? PRICES.get(item.name.toLowerCase()) ?? 0) * item.quantity, currency: "USD" },
        })),
        receiptUrl: null,
        userEmail: guest ? null : email,
        guestEmail: guest ? String(body.guest?.email || "").toLowerCase() : null,
      };
      orders.unshift(order);
      idempotent.set(body.idempotencyKey, order);
      return json(res, 201, { order: { id, total: priced.total, currency: "USD" }, paymentMethod: "card" });
    }
    if (path === "/storefront/orders" && req.method === "GET") {
      if (need()) return;
      return json(res, 200, { orders: orders.filter((o) => o.userEmail === email) });
    }

    return json(res, 404, { error: { message: `The house API has no route for ${path}.` } });
  });
}).listen(PORT, "127.0.0.1", () => console.log(`mock house api on http://127.0.0.1:${PORT} — ${PRICES.size} lines priced`));
