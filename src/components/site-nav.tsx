"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, UserRound, X } from "lucide-react";
import { nav } from "@/lib/content";
import { AriaWordmark } from "@/components/aria-wordmark";
import { SiteMenu } from "@/components/site-menu";
import { SiteSearch } from "@/components/site-search";
import { BagDrawer } from "@/components/shop/bag-drawer";
import { DeskDrawer } from "@/components/shop/desk-drawer";
import { menu } from "@/lib/navigation";
import { useBag } from "@/lib/cart";

type SiteNavProps = {
  /**
   * The home page holds the nav hidden until the hero choreography goes
   * live, so it fades in with the logo rather than sitting over the
   * loading video. Ordinary pages have nothing to wait for.
   */
  visible?: boolean;
  /**
   * The home page flies its own animated mark from centre-screen into this
   * slot, so it opts out of the static one rather than stacking two marks
   * on the same pixels.
   */
  showMark?: boolean;
};

/** Where across the header we ask what is underneath. Three columns, since
 *  the two controls and the mark can sit over different sections while a
 *  boundary is crossing the band. */
const PROBE_X = [0.12, 0.5, 0.88];

/**
 * Fixed site header, shared by the home experience and every product page
 * so the chrome is identical across the site.
 *
 * ---- Why this is not `mix-blend-mode: difference` ----
 *
 * It used to be, and the idea was sound: white type differenced against the
 * page reads white over black and inverts to near-black over white, with no
 * scroll listener sampling anything. What it cannot survive is MID-GREY.
 * Difference returns |backdrop − white| = 1 − backdrop, so a 50% grey
 * backdrop produces 50% grey type: a contrast ratio of 1:1, which is not
 * low contrast, it is invisible. Grey is not an edge case on this site —
 * it is poured concrete in most of the photography, and it is every frame
 * of the white iris while it is still opening.
 *
 * So the tone is chosen rather than computed. The page already declares its
 * own ground for the type system (`.on-ink` / `.on-paper` per section), and
 * that same declaration is the honest answer to "what is behind the nav" —
 * more honest than sampling pixels, because a grey concrete photograph on a
 * dark section is still dark ground: it wants white type, not grey type.
 *
 * The default is white. The site is ink for ~90% of its length, so light
 * ground is the exception that has to announce itself, and anything that
 * forgets to declare a ground fails safe to the legible option.
 */
export function SiteNav({ visible = true, showMark = true }: SiteNavProps) {
  const { count, ready } = useBag();
  const ref = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);

  /* One at a time. Four panels share this band and each one is a modal
     over the same page: two of them open at once is two dialogs arguing
     about who owns the scroll lock, and the second one to close would hand
     the page back while the first is still over it. Opening any control
     shuts the other three. */
  const only = (which: "menu" | "search" | "bag" | "desk", next: boolean) => {
    setMenuOpen(which === "menu" && next);
    setSearchOpen(which === "search" && next);
    setBagOpen(which === "bag" && next);
    setDeskOpen(which === "desk" && next);
  };

  useEffect(() => {
    const header = ref.current;
    if (!header) return;

    const update = () => {
      const rect = header.getBoundingClientRect();
      const y = rect.top + rect.height / 2;

      /* The white iris is `pointer-events: none`, and elementsFromPoint
         skips those — so the one moment the page is most emphatically
         light is the one moment probing cannot see. `light-scroll` is the
         flag the overlay already raises when the iris has fully landed;
         reuse it rather than adding a second source of truth. */
      /* The overlay is one full-viewport sheet of ink directly under the
         header, so there is nothing to sample and nothing that could
         honestly come back light. Short-circuiting also stops the probe
         flickering the header to light on the frame the panel opens, while
         the page behind it is still the thing under the band. */
      if (header.dataset.menu === "open" || header.dataset.sheet === "open") {
        header.dataset.tone = "dark";
        return;
      }

      let light = document.documentElement.classList.contains("light-scroll");

      if (!light) {
        let votes = 0;
        for (const fx of PROBE_X) {
          const hits = document.elementsFromPoint(window.innerWidth * fx, y);
          for (const el of hits) {
            if (header.contains(el)) continue; // the nav is not its own backdrop
            const ground = el.closest(".on-paper, .on-ink");
            if (!ground) continue;
            if (ground.classList.contains("on-paper")) votes += 1;
            break;
          }
        }
        /* Majority, not "any": while a boundary crosses the band the three
           columns disagree, and flipping on the first light hit makes the
           header change tone a third of a second before the ground under
           most of it actually does. */
        light = votes > PROBE_X.length / 2;
      }

      header.dataset.tone = light ? "light" : "dark";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    /* `light-scroll` is toggled by WhiteDotOverlay from ITS scroll handler,
       and this component's handler is registered first (the nav mounts
       above the overlay), so within a single scroll event we read the class
       one tick before it is written — the nav stayed white for a whole
       event after the iris had landed. Watching the attribute instead of
       re-reading it on a timer makes the order irrelevant. */
    const watch = new MutationObserver(update);
    watch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      watch.disconnect();
    };
    /* menuOpen is a real input to the probe, not just to the markup: the
       `data-menu` attribute is written during render, and without this the
       header would keep reporting the ground of the page underneath until
       the next scroll event. So is `searchOpen`, for the same reason: the
       search sheet is another full sheet of ink directly under the band. */
  }, [menuOpen, searchOpen, bagOpen, deskOpen]);

  return (
    <>
      <header
        ref={ref}
        data-tone="dark"
        /* Read by the tone probe above, and the reason the header can sit
           OVER the overlay rather than under it. */
        data-menu={menuOpen ? "open" : "closed"}
        /* Same job as `data-menu`, for the search sheet. Two attributes
           rather than one shared "something is open", because the menu's
           own choreography reads `data-menu` and would start playing for a
           panel that is not it. */
        data-sheet={searchOpen || bagOpen || deskOpen ? "open" : "closed"}
        /* grid rather than flex space-between: with three children the middle
         one only sits truly centred if the two flanking it are the same
         width, which they aren't ("Log in" vs "Menu"). 1fr/auto/1fr pins the
         mark to the page's centre regardless. */
        className="site-nav fixed inset-x-0 top-0 z-[70] grid grid-cols-[1fr_auto_1fr] items-center px-8 py-6 transition-opacity duration-700"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* ---- left: the way in ----

            MENU used to be the one word in this band, on the argument that
            the way in deserves a label. What it also was, was the only
            control here that was not a glyph, and the close state had to be
            a second word swapped into its place — a label changing under
            the reader's cursor rather than the control showing them what it
            had become.

            Three bars folding into a cross does that job with no words at
            all, and it is the one icon on the internet that needs less
            teaching than the magnifier next to it. The word survives as the
            accessible name, which flips between MENU and CLOSE exactly as
            it used to. */}
        <div className="nav-cluster justify-self-start">
          <button
            type="button"
            className="nav-icon nav-burger"
            onClick={() => only("menu", !menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? menu.close : nav.left}
            title={menuOpen ? menu.close : nav.left}
          >
            <span aria-hidden />
            <span aria-hidden />
            <span aria-hidden />
          </button>

          {/* The same tap both ways: it opens the sheet and it closes it,
              and the glyph turns into the cross that says so. */}
          <button
            type="button"
            className="nav-icon nav-icon--morph"
            onClick={() => only("search", !searchOpen)}
            aria-expanded={searchOpen}
            aria-label={searchOpen ? "Close search" : "Search"}
          >
            <Search className="morph-in" aria-hidden />
            <X className="morph-out" aria-hidden />
          </button>
        </div>

        {showMark ? (
          <Link
            href="/"
            aria-label="Aria Noir — home"
            className="justify-self-center transition-opacity hover:opacity-70"
          >
            {/* stacked ARIA / NOIR lockup — sized off height with width:auto,
              since a fixed width squashes the two lines at small sizes */}
            <AriaWordmark className="h-7 w-auto sm:h-8" />
          </Link>
        ) : (
          <span aria-hidden />
        )}

        {/* ---- right: the errands ----

            The desk and the bag, as glyphs. ACCESS and BAG used to be one
            word in the left column that changed depending on whether the
            reader had been through the door; they are two different
            errands and now they are two different controls, which also
            means the bag is reachable without signing in.

            The profile glyph goes to the DESK, signed in or not. It used
            to divert a stranger to /access, which meant the desk could not
            be reached — or designed — without a session; the desk now
            shows its own three views to anyone and offers the door at the
            foot of them instead of in place of them.

            The tally is a small numeral rather than a filled badge, and it
            waits for `ready`: the bag lives in localStorage, so before
            mount the count is unknown, not zero, and a 0 that becomes a 2
            a frame later reads as the shop finding things it had lost. */}
        <div className="nav-cluster justify-self-end">
          {/* Opens the desk drawer rather than leaving for /desk. It was
              the one control in this band that navigated, and beside two
              glyphs that open a panel and close it again with the same tap,
              a third that walks away is two rules for one row of icons. The
              page still exists and the drawer links to it. */}
          <button
            type="button"
            className="nav-icon nav-icon--morph"
            onClick={() => only("desk", !deskOpen)}
            aria-expanded={deskOpen}
            aria-label={deskOpen ? "Close the desk" : "The desk"}
            title="The desk"
          >
            <UserRound className="morph-in" aria-hidden />
            <X className="morph-out" aria-hidden />
          </button>

          {/* Opens the drawer rather than going to /bag. The page still
              exists and the drawer's own foot links to it — what changes is
              that glancing at your own bag no longer costs you the page you
              were reading. */}
          <button
            type="button"
            className="nav-icon nav-icon--morph"
            onClick={() => only("bag", !bagOpen)}
            aria-expanded={bagOpen}
            aria-label={
              bagOpen
                ? "Close the bag"
                : ready && count
                  ? `${nav.bag}, ${count} ${count === 1 ? "piece" : "pieces"}`
                  : nav.bag
            }
            title={nav.bag}
          >
            <ShoppingBag className="morph-in" aria-hidden />
            <X className="morph-out" aria-hidden />
            {ready && count && !bagOpen ? (
              <span className="nav-icon-count" aria-hidden>
                {count}
              </span>
            ) : null}
          </button>
        </div>

      </header>

      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} />
      <DeskDrawer open={deskOpen} onClose={() => setDeskOpen(false)} />
    </>
  );
}
