import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as arca from "@/lib/arca-ii";

export const metadata: Metadata = {
  alternates: { canonical: "/arca-ii" },
  title: "ARCA II | Aria Noir",
  description: "ARCA II revisits the original silhouette in patterned acetate. The campaign pairs concrete interiors with warm light and touches of gold.",
  openGraph: { title: "ARCA II | Aria Noir", description: "ARCA II revisits the original silhouette in patterned acetate. The campaign pairs concrete interiors with warm light and touches of gold." },
  twitter: { card: "summary_large_image", title: "ARCA II | Aria Noir", description: "ARCA II revisits the original silhouette in patterned acetate. The campaign pairs concrete interiors with warm light and touches of gold." },
};

/**
 * ARCA II. The same template ARCA I runs, handed a different copy deck —
 * which is the point: a house is a copy deck and a plate folder, not a
 * second implementation. See components/product/story-page.tsx.
 */
export default function ArcaTwoPage() {
  return <StoryPage story={arca} slug="arca-ii" />;
}
