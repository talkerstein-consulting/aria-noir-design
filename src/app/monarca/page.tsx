import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as monarca from "@/lib/monarca";

export const metadata: Metadata = {
  alternates: { canonical: "/monarca" },
  title: "MONARCA | Aria Noir",
  description: "MONARCA, in reflected light. View the frame from the front and in profile.",
  openGraph: { title: "MONARCA | Aria Noir", description: "MONARCA, in reflected light. View the frame from the front and in profile." },
  twitter: { card: "summary_large_image", title: "MONARCA | Aria Noir", description: "MONARCA, in reflected light. View the frame from the front and in profile." },
};

export default function MonarcaPage() {
  return <StoryPage story={monarca} slug="monarca" />;
}
