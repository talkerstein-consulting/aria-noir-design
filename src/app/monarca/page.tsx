import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as monarca from "@/lib/monarca";

export const metadata: Metadata = {
  title: "MONARCA — Aria Noir",
  description:
    "A cinematic frame shaped by shadow, reflection, and the quiet drama of forgotten places.",
};

export default function MonarcaPage() {
  return <StoryPage story={monarca} slug="monarca" />;
}
