/**
 * Where the reader was before they came to the till.
 *
 * ---- Why this exists rather than `history.back()` ----
 *
 * The bag's way out should return someone to what they were looking at.
 * Browser-back nearly does that and fails in the one case that matters: the
 * bag is linkable and menu-reachable, so a reader can arrive with no
 * in-site history behind them — from a shared link, a bookmark, a new tab —
 * and `history.back()` then walks them off the site entirely. A control
 * that sometimes leaves the shop is worse than no control.
 *
 * It is also wrong in a subtler way. Back goes to the PREVIOUS ENTRY, which
 * after a few taps around the bag and the desk is the bag again. What the
 * reader means by "back" is the last place they were SHOPPING, not the last
 * URL they touched.
 *
 * So the shop remembers that place as they browse, and the control is an
 * ordinary link to it. Always somewhere in the house, always the frames if
 * there is nothing better to say.
 *
 * ---- sessionStorage, deliberately ----
 *
 * Per tab, and gone when the tab closes. This is a breadcrumb for one visit,
 * not a preference — a reader returning tomorrow should not be sent back to
 * a colourway they looked at once. It is read and written inside try/catch
 * because storage throws rather than returning null in a private window or
 * with site data blocked, and losing the breadcrumb must never break a page.
 */

const KEY = "aria:last-browsed";

/** Where to go when nothing has been remembered: the frames. */
export const BROWSE_FALLBACK = "/eyewear";

/**
 * Routes that are the till, not the shop.
 *
 * Landing on one of these must not overwrite the breadcrumb — otherwise
 * walking bag → checkout → back lands you at the bag, which is where you
 * just were. `/held` counts as shopping: it is a list of frames someone is
 * considering, which is exactly the place "back" should return to.
 */
const NOT_BROWSING = ["/bag", "/cart", "/checkout", "/access", "/desk"];

function isBrowsing(path: string) {
  if (path === "/") return false;
  return !NOT_BROWSING.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Called as the reader moves. Ignores the till and anything malformed. */
export function rememberBrowsing(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || !isBrowsing(path)) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    /* Private window, blocked storage. The fallback still works. */
  }
}

/**
 * The last place they were shopping, or the frames.
 *
 * Only ever returns a same-origin path: a stored value that is not a plain
 * absolute path is discarded rather than trusted, so nothing that reaches
 * storage can turn this into an off-site redirect.
 */
export function lastBrowsed(): string {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v && v.startsWith("/") && !v.startsWith("//")) return v;
  } catch {
    /* fall through */
  }
  return BROWSE_FALLBACK;
}

/**
 * The query that opens the bag drawer on arrival.
 *
 * `/bag` is a door, not a page: it works out where the reader was and sends
 * them back there with this set, and the nav opens the drawer when it sees
 * it. That keeps every existing link to the bag working — the menu, search,
 * the checkout's way back, Shopify's post-auth return — without any of them
 * needing to know that the bag stopped being a page.
 */
export const OPEN_BAG_PARAM = "bag";
