import type { Metadata, Viewport } from "next";
import { Cormorant, Figtree, IBM_Plex_Mono } from "next/font/google";
import { RouteWipe } from "@/components/route-wipe";
import { AriaWordmark } from "@/components/aria-wordmark";
import { HouseNotices } from "@/components/house-notices";
import "./globals.css";

/* Headings. Cormorant at 500: its 400 is too fine to hold on black. */
const cormorant = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

/* Body, labels, controls, and Display XS. */
const figtree = Figtree({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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

/* `cover` lets the black run under the iPhone's home indicator and
   toolbar instead of stopping short of them; anything pinned to the bottom
   pads itself with env(safe-area-inset-bottom). */
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#000000",
};

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
/* Long enough for the mark to fade up and hold before it flies to the nav. */
const BOOT_MIN_MS = 400;
const BOOT_MAX_MS = 4000;
/** How long the loader's mark takes to land on the nav's. */
const BOOT_MORPH_MS = 850;
const BOOT_LIFT = `(function(){
  var d=document.documentElement,t0=Date.now(),done=false;
  function finish(){
    d.dataset.boot="done";
    window.dispatchEvent(new Event("aria:boot"));
  }
  /* The loader's mark travels into the nav's mark: measure both, move and
     scale the one onto the other while the sheet fades, then hand over.
     Falls back to the slide if there is no nav mark or motion is off. */
  function lift(){
    if(done)return;done=true;
    var m=document.querySelector(".boot-loader .site-loading-mark");
    var n=document.querySelector(".site-nav .nav-mark svg");
    var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!m||!n||still){finish();return;}
    var a=m.getBoundingClientRect(),b=n.getBoundingClientRect();
    if(!a.width||!b.width){finish();return;}
    /* Width, not scale: the mark is redrawn crisp at every size and lands
       pixel-identical to the nav's. Its parent centres it, so shrinking the
       width keeps its centre still and the translate stays true. */
    var dx=(b.left+b.width/2)-(a.left+a.width/2);
    var dy=(b.top+b.height/2)-(a.top+a.height/2);
    d.dataset.boot="morph";
    var handed=false;
    function hand(){if(handed)return;handed=true;finish();}
    m.addEventListener("transitionend",function(e){if(e.propertyName==="transform")hand();});
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      m.style.width=b.width+"px";
      m.style.transform="translate("+dx+"px,"+dy+"px)";
    });});
    setTimeout(hand,${BOOT_MORPH_MS}+250);
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
      className={`${cormorant.variable} ${figtree.variable} ${plexMono.variable} h-full antialiased`}
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
        <div className="site-loading boot-loader" role="status" aria-label="Loading">
          {/* The same mark as the nav, so the page arrives under the logo it
              keeps. */}
          <AriaWordmark className="site-loading-mark text-paper" />
        </div>
        {children}
        {/* Last in the body, so it is over the page without needing to
            out-rank anything on it. See RouteWipe. */}
        <RouteWipe />
        <HouseNotices />
      </body>
    </html>
  );
}
