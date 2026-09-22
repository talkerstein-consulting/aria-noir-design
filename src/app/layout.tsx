import type { Metadata } from "next";
import { IBM_Plex_Mono, Libre_Bodoni, Manrope } from "next/font/google";
import { BagBar } from "@/components/shop/bag-bar";
import { RouteWipe } from "@/components/route-wipe";
import { MorphNav } from "@/components/morph-nav";
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

/**
 * The header chrome only — Access, Menu and Close. Nothing else on the site
 * is set in it.
 *
 * A monospace is the correct face for a control that swaps its own label:
 * every glyph has the same advance, so MENU and CLOSE occupy exactly the
 * same width and the box cannot change size when the word does. The
 * proportional face made that impossible to fully solve — a reserved column
 * still has to be reserved at SOME width, and an "n" is not an "o".
 *
 * It also happens to be the right voice. These two words are chrome: they
 * label the machine rather than speak for the house, and a mono face is
 * how a control says "I am an instrument" next to a Bodoni wordmark.
 */
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${libreBodoni.variable} ${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body className="min-h-full bg-ink text-paper">
        {/* First thing in the tab order on every page, visible only while
            focused. Every <main> carries id="main" and tabIndex={-1} so the
            jump lands and the next Tab continues from there. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:font-ui focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-ink"
        >
          Skip to content
        </a>
        {/* Cards that grow into the page they open. One delegated
            listener, so the grids stay server-rendered — see
            components/morph-nav. Draws nothing. */}
        <MorphNav />
        {children}
        {/* The bag at the foot of a phone's screen, while the reader
            keeps looking. Drawn only where it is a way on — see BagBar. */}
        <BagBar />
        {/* Last in the body, so it is over the page without needing to
            out-rank anything on it. See RouteWipe. */}
        <RouteWipe />
      </body>
    </html>
  );
}
