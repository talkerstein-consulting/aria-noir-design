"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/lib/content";
import { AriaWordmark } from "@/components/aria-wordmark";
import { SiteMenu } from "@/components/site-menu";
import { CtaLink, CtaButton } from "@/components/cta-link";
import { menu } from "@/lib/navigation";
import { useSession } from "@/lib/session";

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
  const { signedIn } = useSession();
  const ref = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
      if (header.dataset.menu === "open") {
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
       the next scroll event. */
  }, [menuOpen]);

  return (
    <>
      <header
        ref={ref}
        data-tone="dark"
        /* Read by the tone probe above, and the reason the header can sit
           OVER the overlay rather than under it. */
        data-menu={menuOpen ? "open" : "closed"}
        /* grid rather than flex space-between: with three children the middle
         one only sits truly centred if the two flanking it are the same
         width, which they aren't ("Log in" vs "Menu"). 1fr/auto/1fr pins the
         mark to the page's centre regardless. */
        className="site-nav fixed inset-x-0 top-0 z-[70] grid grid-cols-[1fr_auto_1fr] items-center px-8 py-6 transition-opacity duration-700"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Accounts live on Shopify, so this is a link out rather than a
          control with nothing behind it. It sits left because it is the
          colder of the two: whoever wants it already knows they do, while
          the reader who is browsing should find the way INTO the site on
          the side their eye leaves the wordmark towards.

          `tone="quiet"` is what puts the CTA at chrome scale — the quiet
          voice is already the eyebrow size and weight, which is the same
          step `t-label` sat at, so the header keeps its proportions and
          gains the rule and the glyph wave. */}
        {/* One control, two words. ACCESS to a stranger, BAG to someone
            who has been through the door — the destination is the same
            errand either way, so it is the same control rather than a
            second one appearing beside it.

            No COUNT on it, which is the part worth keeping: a running cart
            total in the chrome is a shop shouting about its own till on
            every page, and this header spends itself on three words and a
            wordmark. The word is a door, not a tally. */}
        <CtaLink
          href={signedIn ? "/bag" : "/access"}
          tone="quiet"
          bare
          strong
          className="justify-self-start"
        >
          {signedIn ? nav.bag : nav.right}
        </CtaLink>

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

        {/* One control, two labels. CLOSE is not a second button living in
            the overlay — it is the lower line of this one, so opening the
            menu lifts MENU out and CLOSE in on exactly the pixels the
            reader just clicked. Nothing moves, nothing re-mounts. That is
            also why the header sits at z-70, above the panel: the panel
            has no close control of its own to cover.

            The travel is upward in BOTH directions — see CtaButton. Closing
            is not the opening played backwards; it is the same lift again,
            because the reader pressed the same button again. */}
        <CtaButton
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          tone="quiet"
          bare
          strong
          alt={menu.close}
          swapped={menuOpen}
          className="justify-self-end"
        >
          {nav.left}
        </CtaButton>
      </header>

      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
