import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as patriarca from "@/lib/patriarca";

export const metadata: Metadata = {
  alternates: { canonical: "/patriarca" },
  title: "PATRIARCA | Aria Noir",
  description: "PATRIARCA’s dark frame and crown medallion appear alongside modern tailoring in a campaign inspired by imperial Rome.",
  openGraph: { title: "PATRIARCA | Aria Noir", description: "PATRIARCA’s dark frame and crown medallion appear alongside modern tailoring in a campaign inspired by imperial Rome." },
  twitter: { card: "summary_large_image", title: "PATRIARCA | Aria Noir", description: "PATRIARCA’s dark frame and crown medallion appear alongside modern tailoring in a campaign inspired by imperial Rome." },
};

export default function PatriarcaPage() {
  return <StoryPage story={patriarca} slug="patriarca" />;
}
