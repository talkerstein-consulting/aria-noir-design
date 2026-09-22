import type { NextConfig } from "next";

/**
 * `/api/house/*` is the house API — the commerce backend the checkout and
 * the desk talk to (see src/lib/house-api.ts). It is proxied rather than
 * called cross-origin so the session cookie is first-party and there is no
 * CORS to argue with. `HOUSE_API_URL` is the service's origin, e.g.
 * http://127.0.0.1:3101 in development.
 */
const HOUSE_API_URL = (process.env.HOUSE_API_URL || "http://127.0.0.1:3101").replace(/\/$/, "");

const nextConfig: NextConfig = {
  /**
   * Next 16 only serves the qualities listed here, and silently falls
   * back to 75 for anything else — which is why `quality={90}` on the
   * home page's sticky plates was still arriving as `q=75` in the URL.
   * 75 is kept because it is what every other image on the site asks
   * for; 90 is for the full-screen plates alone (see sticky-panels).
   */
  images: {
    qualities: [75, 90],
  },
  async rewrites() {
    return [
      {
        source: "/api/house/:path*",
        destination: `${HOUSE_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
