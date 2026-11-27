import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as arca from "@/lib/arca-i";

export const metadata: Metadata = {
  alternates: { canonical: "/arca-i" },
  title: "ARCA I | Aria Noir",
  description: "The first ARCA. Four shapes in solid acetate, set against bare concrete in the original campaign.",
  openGraph: { title: "ARCA I | Aria Noir", description: "The first ARCA. Four shapes in solid acetate, set against bare concrete in the original campaign." },
  twitter: { card: "summary_large_image", title: "ARCA I | Aria Noir", description: "The first ARCA. Four shapes in solid acetate, set against bare concrete in the original campaign." },
};

/**
 * ARCA I. The page is the template in components/product/story-page.tsx
 * handed this house's copy deck; the section order, the palette's
 * condition and the closing counter all live there. What is left here is
 * the title, the words, and the slug that finds the catalogue row.
 */
export default function ArcaOnePage() {
  return <StoryPage story={arca} slug="arca-i" />;
}
