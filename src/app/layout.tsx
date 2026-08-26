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
 * Runs before first paint, and does two jobs that both have to happen
 * BEFORE anything is on screen.
 *
 * 1. Arms the reveals. They only animate once this has marked the
 *    document — so if JS is off or fails to load, every heading and plate
 *    renders plainly visible instead of staying at the start of an
 *    animation that will never run.
 *
 * 2. Marks a return visit. The counter-and-expanding-video opening is a
 *    first-impression, not a toll gate: on every load after the first it
 *    is replaced by a plain black wipe. This has to be a class set before
 *    paint rather than React state, because state is only known after
 *    hydration and by then the opening has already flashed on screen.
 *
 *    sessionStorage, not localStorage: the opening belongs to arriving at
 *    the site, so it should return for a genuinely new visit while a
 *    refresh — the thing that made it feel like a toll gate — skips it.
 *    Wrapped, because Safari's private mode throws on access, and a
 *    throwing preloader gate would take the whole page down with it.
 */
const BOOT = `document.documentElement.classList.add("reveal-ready");
try {
  if (sessionStorage.getItem("an:opened")) {
    document.documentElement.classList.add("revisit");
  } else {
    sessionStorage.setItem("an:opened", "1");
  }
} catch (e) {}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${libreBodoni.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body className="min-h-full bg-ink text-paper">{children}</body>
    </html>
  );
}
