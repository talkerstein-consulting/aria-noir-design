import Image from "next/image";
import { CrumbEyebrow } from "@/components/crumb-eyebrow";
import { RevealText } from "@/components/reveal";

type Segment = { text: string; italic?: boolean };

/**
 * Section-page masthead — ProductHero's centred column with the film taken
 * out.
 *
 * The product hero can spend a full viewport on a video because it is
 * selling one object. A section page cannot: the reader arrived from the
 * menu with a question, and a screen of atmosphere before the first word
 * reads as the page stalling. So this is two-thirds height, the plate sits
 * behind at low contrast, and the type is the subject.
 *
 * `plate` is optional on purpose. The policy pages have no photograph and
 * should not borrow one — they open on type over ink and are better for it.
 */
export function PageHero({
  eyebrow,
  title,
  line,
  plate,
  platePortrait,
  alt,
}: {
  eyebrow: string;
  title: string;
  line?: string | readonly Segment[];
  plate?: string;
  /** A 9:16 cut of the same plate for a phone, where a landscape still
   *  behind a two-thirds-height masthead is mostly its middle third. */
  platePortrait?: string;
  alt?: string;
}) {
  return (
    /* ---- `min-h`, and room for the nav above it ----
    
       62svh with no top padding was not enough for a two-line display
       title: the block is bottom-aligned, so it grew UPWARD, and on a
       laptop "Eyewear by designers, for visionaries." ran straight
       through the fixed wordmark — the trail sat behind ARIA and the
       first line crossed the header rule. 72svh gives the common case
       more room, and the `pt` below is the actual guarantee: the content
       can never start higher than the nav, however long the title is,
       because the section grows past its `min-h` instead. */
    <section className="on-ink relative flex min-h-[72svh] flex-col justify-end overflow-hidden bg-ink">
      {plate && (
        <>
          <Image
            src={plate}
            alt={alt ?? ""}
            fill
            priority
            sizes="100vw"
            className={`object-cover opacity-50 ${platePortrait ? "hidden sm:block" : ""}`}
          />
          {platePortrait ? (
            <Image
              src={platePortrait}
              alt={alt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-50 sm:hidden"
            />
          ) : null}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30"
          />
        </>
      )}

      <div className="relative px-6 pt-28 pb-16 sm:px-10 sm:pt-32 sm:pb-24">
        <div className="stack stack--sm mx-auto max-w-5xl items-center text-center">
          {/* The trail, where this page's eyebrow used to be — and the
              eyebrow again on any route with no trail. See
              components/crumb-eyebrow. */}
          <CrumbEyebrow reveal label={eyebrow} className="t-eyebrow" />
          <RevealText as="h1" text={title} delay={120} className="t-display-xl" />
          {line && (
            <RevealText
              as="p"
              text={line}
              delay={280}
              className="t-display-xs mt-1 max-w-xl"
            />
          )}
        </div>
      </div>
    </section>
  );
}
