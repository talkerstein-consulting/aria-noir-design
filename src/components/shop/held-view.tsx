"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { CtaLink, CtaButton } from "@/components/cta-link";
import { useHeld } from "@/lib/held";
import { useBag } from "@/lib/cart";
import { formatPrice, galleryFor, shopHref, swatchFor } from "@/lib/shop";
import { shopPath } from "@/lib/navigation";

/**
 * The held list.
 *
 * ---- What it is, and what it is for ----
 *
 * A saved frame is a frame the reader is still deciding about, which means
 * the list has two jobs: show it as well as the grid they saved it from —
 * a favourite should never look less like itself than it did when they
 * pressed the heart — and let the decision be finished from here. So every
 * card is a live control: it can go to the bag without a detour through
 * the buy page, and it can be let go.
 *
 * ---- Where it lives ----
 *
 * In this browser. Nothing here is on an account, and the page says so
 * rather than implying a sync that does not happen. See lib/held.
 */
export function HeldView() {
  const { resolved, ready, remove } = useHeld();
  const { add } = useBag();

  if (!ready) {
    /* The list is unknown, not empty. One rule's worth of height, so the
       page does not jump when the answer arrives. */
    return <div className="hairline mt-10" />;
  }

  if (!resolved.length) {
    return (
      <div className="stack stack--sm">
        <p className="t-body t-body--lede">Nothing is being held.</p>
        <p className="t-body max-w-xl text-[var(--fg-tertiary)]">
          Press the heart on any colourway and it waits here. The list lives
          in this browser, not on your account, so it will not follow you to
          another machine.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <CtaLink href="/eyewear">Browse all frames</CtaLink>
          <CtaLink href="/bag" kind="secondary">
            The bag
          </CtaLink>
        </div>
      </div>
    );
  }

  /* Only what the workshop can actually send. "Add all" that silently
     skips two of five is a button that lies about what it did, so the
     count is on the label and the skipped ones are named underneath. */
  const addable = resolved.filter((r) => r.entry?.available);
  const skipped = resolved.length - addable.length;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <p className="t-caption">
          {resolved.length} {resolved.length === 1 ? "piece" : "pieces"} held
        </p>
        {addable.length > 0 ? (
          <CtaButton
            onClick={() =>
              addable.forEach((r) => add(r.line.slug, r.line.colorway, 1))
            }
          >
            {addable.length === resolved.length
              ? "Add all to bag"
              : `Add ${addable.length} to bag`}
          </CtaButton>
        ) : null}
      </div>

      {skipped > 0 ? (
        <p className="t-caption mt-3 text-[var(--fg-quiet)]">
          {skipped === 1
            ? "One held colourway is out of the workshop and cannot be added."
            : `${skipped} held colourways are out of the workshop and cannot be added.`}
        </p>
      ) : null}

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {resolved.map(({ line, house, entry }) => {
          const image = house
            ? galleryFor(house, line.colorway)[0]
            : undefined;
          const gone = !entry || !entry.available;
          return (
            <article key={`${line.slug}:${line.colorway}`} className="relative">
              <button
                type="button"
                className="hold-card-remove"
                onClick={() => remove(line.slug, line.colorway)}
                aria-label={`Stop holding ${house?.name ?? line.slug}, ${line.colorway}`}
                title="Let go"
              >
                <Heart aria-hidden />
              </button>

              <Link
                href={
                  house
                    ? `${shopPath(house)}?colourway=${encodeURIComponent(line.colorway)}`
                    : "/eyewear"
                }
                className="block"
              >
                <div
                  className="card-shot"
                  /* The acetate under the photograph, for the colourways
                     the shoot has not reached. Honest about being an
                     approximation rather than showing a sibling colour. */
                  style={{ background: swatchFor(line.colorway) }}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`${house?.name ?? ""} in ${line.colorway}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      /* Below the fold on every screen this list fits on. */
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <h2 className="card-name mt-5">{house?.name ?? line.slug}</h2>
                <p className="t-caption mt-1">{line.colorway}</p>
              </Link>

              <div className="mt-4 flex items-baseline justify-between gap-4">
                <p className="t-caption tabular-nums">
                  {entry ? formatPrice(entry.cents) : "—"}
                </p>
                {gone ? (
                  <span className="t-caption text-[var(--fg-quiet)]">
                    Out of the workshop
                  </span>
                ) : (
                  <CtaButton onClick={() => add(line.slug, line.colorway, 1)}>
                    Add to bag
                  </CtaButton>
                )}
              </div>

              {gone && house ? (
                <p className="t-caption mt-2">
                  <Link
                    href={shopHref(house, line.colorway)}
                    className="link-quiet"
                  >
                    Ask to be written to
                  </Link>
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
