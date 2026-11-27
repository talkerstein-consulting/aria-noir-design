import type { Metadata } from "next";
import { StoryPage } from "@/components/product/story-page";
import * as ahava from "@/lib/ahava";

export const metadata: Metadata = {
  alternates: { canonical: "/ahava" },
  title: "AHAVA | Aria Noir",
  description: "A closer look at AHAVA, from the line of the frame to the way it sits on the face.",
  openGraph: { title: "AHAVA | Aria Noir", description: "A closer look at AHAVA, from the line of the frame to the way it sits on the face." },
  twitter: { card: "summary_large_image", title: "AHAVA | Aria Noir", description: "A closer look at AHAVA, from the line of the frame to the way it sits on the face." },
};

export default function AhavaPage() {
  return <StoryPage story={ahava} slug="ahava" />;
}
