import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as ahava from "@/lib/ahava";

export const metadata: Metadata = {
  alternates: { canonical: "/ahava" },
  title: "AHAVA | Aria Noir",
  description: "AHAVA’s angular acetate meets the soft morning light of a Paris apartment in the Aria Noir lookbook.",
  openGraph: { title: "AHAVA | Aria Noir", description: "AHAVA’s angular acetate meets the soft morning light of a Paris apartment in the Aria Noir lookbook." },
  twitter: { card: "summary_large_image", title: "AHAVA | Aria Noir", description: "AHAVA’s angular acetate meets the soft morning light of a Paris apartment in the Aria Noir lookbook." },
};

export default function AhavaPage() {
  return <StoryPage story={ahava} slug="ahava" />;
}
