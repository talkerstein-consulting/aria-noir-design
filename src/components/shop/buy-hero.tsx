"use client";

import Image from "next/image";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import type { House } from "@/lib/navigation";
import {
  COLLECTION_LABEL,
  defaultColorway,
  galleryFor,
  squareFor,
  plateRatio,
  priceOf,
  stockFor,
  swatchFor,
} from "@/lib/shop";
import { useBag } from "@/lib/cart";
import { CtaButton, CtaLink } from "@/components/cta-link";
import { RevealPlate } from "@/components/reveal";
import { ColourwayPicker } from "@/components/shop/colourway-picker";
import { QtyStepper } from "@/components/shop/qty-stepper";
import { BagAdded } from "@/components/shop/bag-added";
import { HoldToggle } from "@/components/shop/hold-toggle";




export function BuyHero({ house }: { house: House }) {
  /* Seeded with the house's hero colourway, and with the SAME rule the
     picker uses — see defaultColorway. The opening turns a specific
     acetate; the panel beside it has to name that one. */
  /* A link from elsewhere in the build can name the acetate it meant:
     `/shop/<slug>?colourway=…`, which is what `shopHref` writes and what
     the story pages' `buyColour` has been writing since before anything
     read it.

     DERIVED, not copied into state by an effect. `picked` is only what
     this reader has chosen with the picker; until they choose, the
     selection follows the URL. Seeding state from the param in an effect
     would be the same value stored twice, one render late, and would fight
     the picker on every back-navigation. */
  const [picked, setPicked] = useState<string | null>(null);
  const params = useSearchParams();
  /* The American spelling is accepted too: the codebase's own identifiers
     use it, and a link that silently does nothing is the worse failure. */
  const asked = params.get("colourway") ?? params.get("colorway");
  /* `defaultColorway` is the picker's own rule, so a param naming a
     colourway the house does not carry — or has sold out of — falls back
     to the hero acetate rather than showing an empty picker. */
  const chosen = picked ?? (defaultColorway(house, asked) || null);

  const [qty, setQty] = useState(1);

  /* The buy control, and the box that holds its place while it is pinned. */
  const buyRowRef = useRef<HTMLDivElement>(null);
  const buySlotRef = useRef<HTMLDivElement>(null);
  /* A SNAPSHOT of what went in, not a flag. The picker and the stepper
     behind the sheet stay live, so reading `chosen` and `qty` from inside
     it would let the confirmation change its mind about what it just
     confirmed. Null when the sheet is down. */
  const [added, setAdded] = useState<{ colorway: string; qty: number } | null>(
    null,
  );

  const entry = stockFor(house).find((e) => e.colorway === chosen);
  const available = entry?.available === true;
  const { add, lines, ready } = useBag();

  /* Whether the bag ALREADY holds this house in this colourway.
     `added` would have been the cheaper source, but it is cleared the
     moment the confirmation sheet is dismissed — so the label would say
     "Add again" for exactly as long as the sheet covered it and revert
     the instant it went. The bag itself is the thing the word is about,
     and it is also what makes the answer follow a change of colourway:
     a reader who owns the black and is now looking at the tortoise is
     being told, correctly, that this one is not in there.

     `ready` gates it because the bag is read from storage after mount —
     without it the server renders one word and the client another. */
  const inBag =
    ready &&
    chosen !== null &&
    lines.some((l) => l.slug === house.slug && l.colorway === chosen);

  /* ---- One plate: the colourway's square ----
   *
   * Not the whole shoot. The buy page is a decision about an acetate, and
   * the acetate is one photograph — the run's square render, the same
   * picture the card that sent the reader here was showing, so arriving
   * reads as the object continuing rather than a second listing.
   *
   * The rest of the colourway's set is the STORY page's business; the
   * link at the foot of this column goes there. A house with no square
   * (ARCA I, never shot on the sill) falls back to the first plate it
   * does have. */
  const square = squareFor(house, chosen ?? undefined);
  const images = square
    ? [square]
    : galleryFor(house, chosen ?? undefined).slice(0, 1);


  /* No model on this page at all. The turntable, its opening, the
     per-colourway glb and the scroll floor that guarded the opening have
     all gone: the buy page is the offer and the photographs of the acetate
     being bought. The 3D lives on the story page, which is where the
     object is being argued for rather than chosen. */
  const acetate = swatchFor(chosen ?? house.colorwayNames[0]);

  const addToBag = () => {
    if (!chosen) return;
    add(house.slug, chosen, qty);
    setAdded({ colorway: chosen, qty });
  };

  const panelRef = useRef<HTMLDivElement>(null);
  /* The panel's CONTENT, transformed separately from the sticky box that
     holds it. Transforming the sticky element itself would mean measuring
     a box this loop is moving; the outer stays put and honest, the inner
     is what slides. */
  const panelInnerRef = useRef<HTMLDivElement>(null);

  /* The opening choreography that used to live here is gone, and with it
     the turntable it moved. The buy page no longer performs an arrival:
     it opens as the offer and the photographs, already in place. See the
     note on the grid below. */

  /* ---- The buy control, pinned where it lands ----

     Phones only, and it is the SAME element throughout: the quantity and
     the button scroll up the page under the colourway picker exactly as
     they always did, and when they reach the foot of the screen they stop
     there and stay for the rest of the page.

     What this replaces was a second copy of the control fixed to the foot
     of the screen, translated out of frame and slid back in once the real
     one had gone. Two controls, one of them announcing an arrival the page
     never earned. There is one now, and it does not travel — it simply
     stops.

     `position: sticky` cannot do this. A sticky element is bounded by its
     own parent, and this row's parent is the offer: a few hundred pixels
     tall, ending long before the photography, the details and the
     catalogue it has to survive. Nothing in the markup is an ancestor of
     both the control and the rest of the page, so the pin is switched by
     hand — which is also what makes it possible to keep the row's exact
     width and left edge rather than letting a fixed element go full bleed
     and stop looking like the row it was.

     The slot around it keeps its height in the flow, so the offer does not
     close up by the height of a button the moment it pins. */
  useEffect(() => {
    const row = buyRowRef.current;
    const slot = buySlotRef.current;
    if (!row || !slot) return;

    const narrow = window.matchMedia("(max-width: 1023px)");
    let pinned = false;
    let gone = false;

    /* The film in the detail section below, looked up by the handle it
       carries. Held loosely: a house with no video renders a photograph in
       its place and still has the element, but if the section is ever
       absent the control simply never leaves — which is the safer of the
       two failures. */
    const film = () => document.querySelector(".buy-film");

    const release = () => {
      pinned = false;
      gone = false;
      row.removeAttribute("data-gone");
      row.style.position = "";
      row.style.bottom = "";
      row.style.left = "";
      row.style.width = "";
      slot.style.height = "";
      row.removeAttribute("data-pinned");
    };

    const check = () => {
      if (!narrow.matches) {
        if (pinned) release();
        return;
      }

      /* Measured off the SLOT, never off the row. The row is the thing
         this moves, so reading its box to decide whether to move it is a
         loop that latches: pin it, and its rect says it is at the pin
         line, so it stays pinned however far back up the reader scrolls.
         The slot is in flow and stays there, so its box is the row's
         honest, unpinned position at all times.

         The line is the FOOT of the screen, and the test is on the slot's
         bottom edge rather than its top. Scrolling down, the control rises
         out of the fold; the frame its bottom edge reaches the bottom of
         the viewport is the frame it is caught, which is why the lock is
         invisible — the pinned position and the position it was travelling
         through are the same position.

         Below that line it is pinned too, now: on a phone the offer opens
         under a lead photograph and the control's honest position is a
         screen and a half down, so a first load showed a product page with
         no till on it. Held at the foot from the first frame, it is where
         the reader's thumb already is; and once the slot scrolls up to
         meet it the two positions coincide and nothing visibly changes.
         The resize bookkeeping below still runs every frame. */
      const next = true;
      if (next === pinned) {
        /* Still pinned, but the page may have been resized under it — and
           the film may have gone by since the last frame. */
        if (pinned) {
          const box = slot.getBoundingClientRect();
          row.style.left = `${box.left}px`;
          row.style.width = `${box.width}px`;
          follow();
        }
        return;
      }
      pinned = next;

      if (!next) {
        release();
        return;
      }

      /* Height is frozen BEFORE the row leaves the flow — once it is out,
         the slot has nothing left to measure. */
      const box = slot.getBoundingClientRect();
      slot.style.height = `${box.height}px`;
      row.style.position = "fixed";
      row.style.bottom = "0px";
      row.style.left = `${box.left}px`;
      row.style.width = `${box.width}px`;
      row.setAttribute("data-pinned", "true");
      follow();
    };

    /* ---- and where it stops following ----

       The control holds through the photographs and the detail copy, and
       takes itself away once the film has gone past the top of the screen.
       Below that point the page is the film, the care page and the rest of
       the catalogue — pages about other frames — and a buy button for THIS
       one parked over them is the shop following someone around after they
       have stopped looking.

       This one does travel: it slides down out of frame rather than
       blinking off. A pinned element leaving under its own edge is the one
       piece of motion here that describes something real — it is going
       back to where it came from, and it comes back up the same way. */
    const follow = () => {
      const f = film();
      const next = pinned && !!f && f.getBoundingClientRect().bottom < 0;
      if (next === gone) return;
      gone = next;
      if (next) row.setAttribute("data-gone", "true");
      else row.removeAttribute("data-gone");
    };

    check();
    const lenis = (
      window as unknown as {
        __lenis?: {
          on?: (e: string, f: () => void) => void;
          off?: (e: string, f: () => void) => void;
        };
      }
    ).__lenis;
    lenis?.on?.("scroll", check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    narrow.addEventListener("change", check);
    return () => {
      lenis?.off?.("scroll", check);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      narrow.removeEventListener("change", check);
      release();
    };
  }, []);

  /* Every cut of this house, fetched up front. The run is four small
     Draco-compressed files and the reader is being invited to click
     between them, so paying for them once on arrival is cheaper than
     tearing the scene down on each swap.
     
     Only where there is a turntable to feed. On a phone there is none, and
     prefetching four meshes for a canvas that will never mount is the
     largest download on the page bought for nothing. */


  /* A new acetate is a new glb, and it arrives whenever it arrives. Fading
     the canvas out and back covers the swap — without it the frame either
     pops from one colour to another or, worse, shows the old one until the
     new one has finished loading.

     The fade-back waits on the MODEL, not on a clock. It used to be a 90ms
     timeout, which is right for a cached swap and wrong for the one that
     matters: on a cold load the glb takes a second or two, so the stage
     went opaque over an empty ground and the frame appeared at full
     strength when it finished — the opening's first impression was a pop.
     `onReady` fires from inside the suspended viewer, so the frame is
     there before the opacity moves and the arrival is the transition the
     stylesheet already describes. */


  return (
    <>
      {/* Three children, in the order a PHONE wants them: the frame, then
          the offer, then the photographs. On a wide screen the stylesheet
          puts the frame and the photographs back in one column with the
          offer beside them — see .buy-grid. Ordering it this way round
          means the small screen needs no reordering at all, which is the
          screen that can least afford a `order:` rule going stale. */}
      <div className="buy-grid mx-auto grid max-w-7xl grid-cols-1 items-start">
        {/* ---- the offer ---- */}
        {/* ---- the offer, held still ----

            Its sticky `top` is `--buy-top`, the buy section's own top
            padding (see .buy-section in interactions.css). Matching them
            means the panel is already AT its sticky position on the first
            frame, so it pins the instant the page moves instead of sliding
            up and then catching. */}
        <div ref={panelRef} className="buy-panel buy-grid-panel">
          <div ref={panelInnerRef} className="buy-panel-inner">
          {/* The name arrives WITH the offer, and stays. The opening's
              centred copy is decorative; this is the page's h1. */}
          {/* A plain eyebrow. This slot has held a breadcrumb trail and a
              back control in turn; it holds neither now. The page is
              reached from the story, the header carries the menu and the
              wordmark, and the reader here is deciding on a frame rather
              than navigating — so the line says what the frame IS and
              leaves the way out to the chrome. */}
          <p className="t-eyebrow">{COLLECTION_LABEL}</p>
          <h1 className="t-display-lg mt-3">{house.name}</h1>
          <p className="buy-colourway mt-2">{chosen}</p>

          {/* The acetates come straight after the name, before the note
              and the price. They are the one decision the page asks for
              and they were the first thing below the fold: on a phone the
              lead picture, the name and a paragraph stood between the top
              of the screen and the first swatch. Under the name they are
              on the first screen at every width; the price keeps its
              place beside the control that spends it. */}
          <div className="mt-6">
            <Suspense fallback={null}>
              <ColourwayPicker house={house} onChoose={setPicked} />
            </Suspense>
          </div>

          <p className="t-body mt-6 text-[var(--fg-tertiary)]">{house.note}</p>

          <p className="buy-price mt-6 tabular-nums">
            {priceOf(house, chosen ?? undefined)}
          </p>

          <div className="hairline mt-6 pt-6">
            {/* The slot keeps the row's height in the offer's flow while the
                row itself is pinned to the top of a phone's screen, so the
                panel does not collapse by 48px the instant it pins. */}
            <div ref={buySlotRef} className="buy-slot mt-2">
              <div ref={buyRowRef} className="buy-row">
              <QtyStepper value={qty} onChange={setQty} />
              {/* The swap said "In the bag" before, and it described the bag
                  rather than the button: a filled CTA whose label is a
                  statement of fact reads as spent, so a reader wanting a
                  second pair had no word telling them the control still
                  works. "Add again" is the same swap saying what another
                  press actually does. */}
              {available ? (
                <CtaButton
                  className="flex-1"
                  alt="Add again"
                  swapped={inBag}
                  onClick={addToBag}
                >
                  Add to bag
                </CtaButton>
              ) : (
                <button type="button" className="cta-main flex-1" disabled>
                  Out of the workshop
                </button>
              )}
              </div>
            </div>

            <p className="t-caption mt-6">
              {available
                ? "Ships in 3–5 days. Free worldwide standard shipping."
                : "Made in runs. Tell us and we will write when this one returns."}
            </p>

            {/* The third thing a reader can do with a frame, after buying
                it and leaving. It sits UNDER the shipping line rather than
                beside Add to bag: a save is the quieter of the two
                intentions and should not be competing for the same
                pixels. For a colourway that is out of the workshop it is
                the only thing left to press, which is the whole reason it
                exists on this panel. */}
            <HoldToggle
              slug={house.slug}
              colorway={chosen}
              className="mt-6"
            />

          </div>
          </div>
        </div>

        {/* ---- the lead photograph, phones only ----

            One picture above the offer, and the rest of the column below
            it. With the turntable gone from phones the page had no image
            before the name and the price; with the WHOLE column moved
            above them it had six, and the colourways and the buy button
            were most of a page away.

            It is a second element rather than a reordering because the
            column is one flow item and a grid cannot lift a single child
            out of it. The same file, so the browser fetches it once, and
            the copy in the column below is hidden at this width — see
            `.buy-grid-lead`. */}
        {images.length ? (
          /* 4:3 rather than square, and cropped towards the foot of the
             plate. A square lead put the acetates a full screen down on a
             phone; a quarter shorter, the name AND the colourways fit on
             the first screen. The colourway plates stand the frame on a
             surface in the lower half, so the crop is anchored there — a
             centred 4:3 of a "tall" plate was the wall behind the frame
             and nothing of the frame. */
          <div className="buy-grid-lead relative aspect-[4/3] overflow-hidden bg-ink">
            <Image
              src={images[0]}
              alt={`${house.name}${chosen ? ` — ${chosen}` : ""}, ${house.material}`}
              fill
              sizes="100vw"
              priority
              className="object-cover object-[50%_62%]"
            />
          </div>
        ) : null}

        {/* ---- the photographs ---- */}
        <div className="buy-grid-photos stack stack--sm">
          {images.length ? (
            images.map((src, i) => (
              /* ONE WIDTH, and nothing cropped to reach it.

                 The column is a mixed set: the colourway shots are
                 1920x1080 and ARCA I's macros are square. It was a square
                 box on `cover`, which threw away forty-four percent of the
                 width of every landscape shot on the page a person is
                 deciding on — usually the temples, which is most of what
                 distinguishes one of these cuts from another. Landscape and
                 `contain` fixed the crop and left the second half of the
                 problem: the square macros then rendered forty-four percent
                 NARROWER than the product shots, in a column whose whole
                 job is to be one column.

                 So the box is the full width and takes its height from the
                 plate. The product shot is the reference — it is 16:9 and
                 that is what the column measures — and every other plate
                 matches its width and is as tall as it needs to be.
                 `plateRatio` is measured at author time, so the space is
                 reserved before the picture lands and the column does not
                 jump as it fills. 16/9 is the fallback for a plate the
                 manifest has never seen. */
              <RevealPlate
                key={src}
                className="relative w-full overflow-hidden bg-ink"
                /* Square, because the plate IS the square render. The
                   measured ratio is the fallback for the one house whose
                   run has no square and shows its own first plate. */
                style={{
                  aspectRatio: square ? 1 : (plateRatio(src) ?? 16 / 9),
                }}
              >
                <Image
                  src={src}
                  alt={
                    i === 0
                      ? `${house.name}${chosen ? ` — ${chosen}` : ""}, ${house.material}`
                      : ""
                  }
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  priority={i === 0}
                  /* cover, not contain: the box now IS the plate's ratio,
                     so the two agree and there is nothing to letterbox. */
                  className="arca-rise object-cover"
                />
              </RevealPlate>
            ))
          ) : (
            /* No photograph of this acetate yet. The swatch stands in —
               the last honest thing the page can show. There is no
               turntable to fall back to any more. */
            <div
              className="flex aspect-[16/9] w-full items-end p-6 transition-colors duration-500"
              style={{
                background: `linear-gradient(160deg, ${acetate} 0%, var(--ink) 82%)`,
              }}
            >
              <span className="t-micro">
                {chosen
                  ? `${chosen} — photography in progress`
                  : "Photography in progress"}
              </span>
            </div>
          )}

          {/* ---- The way back to the argument, at the foot of the gallery ----
          
              After the photographs, not beside the offer. Next to the buy
              control it competed with it — two things to press in one
              corner, one of them leading away from the sale. Here it is
              what a reader meets when they have finished LOOKING and are
              still deciding, which is the moment the story answers.
          
              The label names the HOUSE, not the acetate. The story is
              AHAVA's — the block, the bench, the cut — and every colourway
              on this page shares it; "Read the Velvet Rose story" promised
              a page about one acetate that does not exist. */}
          {house.href ? (
            <CtaLink href={house.href} kind="secondary" className="mt-6">
              {`Read the ${house.name} story`}
            </CtaLink>
          ) : null}
        </div>


      </div>

      {added ? (
        <BagAdded
          house={house}
          colorway={added.colorway}
          qty={added.qty}
          onClose={() => setAdded(null)}
        />
      ) : null}
    </>
  );
}
