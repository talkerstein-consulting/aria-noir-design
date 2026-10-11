import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { allHouses } from "@/lib/navigation";
import { apparel } from "@/lib/apparel";
import { policies } from "@/lib/policies";

/** Indexable routes only — the bag, checkout and account rooms are noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/collections",
    "/shop",
    "/gallery",
    "/house/about",
    "/contact",
    "/care",
    ...allHouses.map((h) => `/${h.slug}`),
    ...allHouses.map((h) => `/shop/${h.slug}`),
    ...apparel.map((a) => `/shop/${a.slug}`),
    ...policies.map((p) => `/policies/${p.slug}`),
  ];
  return [...new Set(paths)].map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
