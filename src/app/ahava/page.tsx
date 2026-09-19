import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as ahava from "@/lib/ahava";

export const metadata: Metadata = {
  title: "AHAVA — Aria Noir",
  description:
    "A sculptural frame designed for quiet mornings, soft light, and moments entirely your own.",
};

export default function AhavaPage() {
  return <StoryPage story={ahava} slug="ahava" />;
}
