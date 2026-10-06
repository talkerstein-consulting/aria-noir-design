import type { Metadata } from "next";
import { IBM_Plex_Mono, Libre_Bodoni, Manrope } from "next/font/google";
import { RouteWipe } from "@/components/route-wipe";
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
  /* 400 only. Nothing on the site sets the mono heavier, and Plex Mono is
     not a variable font — each weight listed was its own file on every
     page. Not preloaded: it sets a handful of small labels, never the
     first thing read, so it can arrive after the faces that are. */
  weight: ["400"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Aria Noir",
  description: "Eyewear, carved not assembled.",
};

/**
 * Runs before first paint and arms the reveals. They only animate once
 * this has marked the document — so if JS is off or fails to load, every
 * heading and plate renders plainly visible instead of staying at the
 * start of an animation that will never run.
 */
const BOOT = `document.documentElement.classList.add("reveal-ready");`;

/**
 * Lifts the boot sheet. Every route here is prerendered, so `loading.tsx`
 * never shows on a first visit — the HTML is already there, and what the
 * reader waits on is fonts, scripts and the first images. This waits for
 * the window's `load` (and the fonts), holds the mark long enough to be
 * read, and never longer than BOOT_MAX_MS: a slow line gets the page late
 * rather than a loader forever. `aria:boot` tells the home opening it can
 * start now that someone can see it.
 */
const BOOT_MIN_MS = 900;
const BOOT_MAX_MS = 4000;
const BOOT_LIFT = `(function(){
  var d=document.documentElement,t0=Date.now(),done=false;
  function lift(){
    if(done)return;done=true;
    d.dataset.boot="done";
    window.dispatchEvent(new Event("aria:boot"));
  }
  function ready(){
    var f=document.fonts&&document.fonts.ready||Promise.resolve();
    f.then(function(){setTimeout(lift,Math.max(0,${BOOT_MIN_MS}-(Date.now()-t0)))});
  }
  if(document.readyState==="complete")ready();
  else window.addEventListener("load",ready,{once:true});
  setTimeout(lift,${BOOT_MAX_MS});
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${libreBodoni.variable} ${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <script dangerouslySetInnerHTML={{ __html: BOOT_LIFT }} />
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
        {/* The first-visit loader. Server-rendered so it is the first thing
            painted, and lifted by BOOT_LIFT above; see `.boot-loader`. */}
        <div className="site-loading boot-loader" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element --
              the mark animates inside the SVG; next/image would rasterise it. */}
          <img src="/logo/aria-loader.svg" alt="" className="site-loading-mark" />
        </div>
        {children}
        {/* Last in the body, so it is over the page without needing to
            out-rank anything on it. See RouteWipe. */}
        <RouteWipe />
      </body>
    </html>
  );
}
