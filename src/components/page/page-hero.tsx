import Image from "next/image";
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
  alt,
}: {
  eyebrow: string;
  title: string;
  line?: string | readonly Segment[];
  plate?: string;
  alt?: string;
}) {
  return (
    <section className="on-ink relative flex min-h-[62svh] flex-col justify-end overflow-hidden bg-ink">
      {plate && (
        <>
          <Image
            src={plate}
            alt={alt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30"
          />
        </>
      )}

      <div className="relative px-6 pb-16 sm:px-10 sm:pb-24">
        <div className="stack stack--sm mx-auto max-w-5xl items-center text-center">
          <RevealText as="p" text={eyebrow} className="t-eyebrow" />
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
