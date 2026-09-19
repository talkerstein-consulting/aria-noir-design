import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as arca from "@/lib/arca-ii";

export const metadata: Metadata = {
  title: "ARCA II — Aria Noir",
  description:
    "The second cut. One shape, eight colourways, and an inlaid gold plaque that is the only part of the frame finished to catch light.",
};

/**
 * ARCA II. The same template ARCA I runs, handed a different copy deck —
 * which is the point: a house is a copy deck and a plate folder, not a
 * second implementation. See components/product/story-page.tsx.
 */
export default function ArcaTwoPage() {
  return <StoryPage story={arca} slug="arca-ii" />;
}
