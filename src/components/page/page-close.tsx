import { CtaLink } from "@/components/cta-link";
import { RevealText } from "@/components/reveal";

/**
 * Light closing block — ProductClose without the pointer trail.
 *
 * The trail is deliberately not here. On ARCA I it is the last beat of a
 * page that has shown you fifty photographs of one object, and it works
 * because there is a set to fling. A policy page closing on flying plates
 * would be the page performing rather than finishing.
 *
 * `bare` decides where the white comes from. Pages long enough to run the
 * WhiteDotOverlay hand over via the iris and must NOT paint a background
 * of their own — that circle is the site's only dark→light cut, and a
 * second one underneath it reads as a seam. Short pages have no iris to
 * inherit, so they carry `bg-paper` themselves.
 */
export function PageClose({
  heading,
  body,
  cta,
  href,
  bare = false,
  tone = "paper",
}: {
  heading: string;
  body: string;
  cta: string;
  href: string;
  bare?: boolean;
  /** `"ink"` for pages that never invert — the block simply closes the
   *  black rather than being the landing point of an iris. */
  tone?: "paper" | "ink";
}) {
  const ground =
    tone === "ink" ? "on-ink bg-ink" : `on-paper ${bare ? "" : "bg-paper"}`;
  return (
    <section
      className={`${ground} relative z-[38] px-6 pt-[8vh] pb-32 sm:px-10 sm:pb-48`}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
        <RevealText as="h2" text={heading} className="t-display-lg" />
        <p className="t-body t-body--lede">{body}</p>
        <CtaLink
          href={href}
          variant={tone === "ink" ? "light" : "dark"}
          className="mt-4"
        >
          {cta}
        </CtaLink>
      </div>
    </section>
  );
}
