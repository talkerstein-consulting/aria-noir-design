import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as matriarca from "@/lib/matriarca";

export const metadata: Metadata = {
  alternates: { canonical: "/matriarca" },
  title: "MATRIARCA | Aria Noir",
  description: "MATRIARCA in close-up. See the bridge, temples and profile.",
  openGraph: { title: "MATRIARCA | Aria Noir", description: "MATRIARCA in close-up. See the bridge, temples and profile." },
  twitter: { card: "summary_large_image", title: "MATRIARCA | Aria Noir", description: "MATRIARCA in close-up. See the bridge, temples and profile." },
};

export default function MatriarcaPage() {
  return <StoryPage story={matriarca} slug="matriarca" />;
}
