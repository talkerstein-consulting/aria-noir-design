import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as matriarca from "@/lib/matriarca";

export const metadata: Metadata = {
  alternates: { canonical: "/matriarca" },
  title: "MATRIARCA | Aria Noir",
  description: "The gateway shape of MATRIARCA’s bridge inspired a campaign set against the architecture of ancient Egypt.",
  openGraph: { title: "MATRIARCA | Aria Noir", description: "The gateway shape of MATRIARCA’s bridge inspired a campaign set against the architecture of ancient Egypt." },
  twitter: { card: "summary_large_image", title: "MATRIARCA | Aria Noir", description: "The gateway shape of MATRIARCA’s bridge inspired a campaign set against the architecture of ancient Egypt." },
};

export default function MatriarcaPage() {
  return <StoryPage story={matriarca} slug="matriarca" />;
}
