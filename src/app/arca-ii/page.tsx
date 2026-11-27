import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as arca from "@/lib/arca-ii";

export const metadata: Metadata = {
  alternates: { canonical: "/arca-ii" },
  title: "ARCA II | Aria Noir",
  description: "ARCA II, seen in low light. Explore the campaign and the frame as worn.",
  openGraph: { title: "ARCA II | Aria Noir", description: "ARCA II, seen in low light. Explore the campaign and the frame as worn." },
  twitter: { card: "summary_large_image", title: "ARCA II | Aria Noir", description: "ARCA II, seen in low light. Explore the campaign and the frame as worn." },
};

/**
 * ARCA II. The same template ARCA I runs, handed a different copy deck —
 * which is the point: a house is a copy deck and a plate folder, not a
 * second implementation. See components/product/story-page.tsx.
 */
export default function ArcaTwoPage() {
  return <StoryPage story={arca} slug="arca-ii" />;
}
