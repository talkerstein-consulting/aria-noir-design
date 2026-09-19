import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as patriarca from "@/lib/patriarca";

export const metadata: Metadata = {
  title: "PATRIARCA — Aria Noir",
  description:
    "A sculptural frame with the weight, presence, and permanence of an heirloom.",
};

export default function PatriarcaPage() {
  return <StoryPage story={patriarca} slug="patriarca" />;
}
