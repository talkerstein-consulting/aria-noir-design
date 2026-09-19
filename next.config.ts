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
