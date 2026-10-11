/**
 * The origin canonical URLs, the sitemap and robots.txt are written against.
 * Set NEXT_PUBLIC_SITE_URL in Vercel to the launch domain; until then it
 * falls back to the house's own domain, never a *.vercel.app preview.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://arianoir.com").replace(/\/$/, "");
