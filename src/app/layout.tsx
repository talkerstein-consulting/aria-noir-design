import type { Metadata } from "next";
import { Libre_Bodoni, Manrope } from "next/font/google";
import "./globals.css";

const libreBodoni = Libre_Bodoni({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aria Noir",
  description: "Eyewear, carved not assembled.",
};

/**
 * Runs before first paint. Reveal animations only arm themselves once this
 * has marked the document — so if JS is off or fails to load, every
 * heading and plate renders plainly visible instead of staying at the
 * start of an animation that will never run.
 */
const ARM_REVEALS = `document.documentElement.classList.add("reveal-ready")`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${libreBodoni.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ARM_REVEALS }} />
      </head>
      <body className="min-h-full bg-ink text-paper">{children}</body>
    </html>
  );
}
