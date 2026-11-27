import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as patriarca from "@/lib/patriarca";

export const metadata: Metadata = {
  alternates: { canonical: "/patriarca" },
  title: "PATRIARCA | Aria Noir",
  description: "PATRIARCA, worn among stone columns. A closer look at its sculptural bridge.",
  openGraph: { title: "PATRIARCA | Aria Noir", description: "PATRIARCA, worn among stone columns. A closer look at its sculptural bridge." },
  twitter: { card: "summary_large_image", title: "PATRIARCA | Aria Noir", description: "PATRIARCA, worn among stone columns. A closer look at its sculptural bridge." },
};

export default function PatriarcaPage() {
  return <StoryPage story={patriarca} slug="patriarca" />;
}
