import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as matriarca from "@/lib/matriarca";

export const metadata: Metadata = {
  title: "MATRIARCA — Aria Noir",
  description:
    "A sculptural frame where precise gold hardware meets the enduring language of ancient architecture.",
};

export default function MatriarcaPage() {
  return <StoryPage story={matriarca} slug="matriarca" />;
}
