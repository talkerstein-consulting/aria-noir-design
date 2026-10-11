import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/bag", "/held", "/desk", "/access", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
