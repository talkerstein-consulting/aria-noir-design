import { CtaLink } from "@/components/cta-link";
import { menu } from "@/lib/navigation";

/**
 * The house's Instagram, at the foot of the homepage (team call, 5 Nov,
 * Raviv relaying Jai: "this social feed needs to go on the bottom of the
 * homepage", styled after Meshki Bridal's social strip: tall, side by
 * side, not a square grid).
 *
 * The posts are the house's own worn photographs until the account is
 * connected: the Instagram Graph API needs a token from the account's
 * owner, and none has been given. Each card links to the account.
 *
 * Portrait cards edge to edge with no gaps, after Meshki's strip (Rems,
 * 23 Nov: "more vertical, bigger tiles"): four across on a desktop, and
 * on a phone one and a bit, so the next card shows and says the row is
 * swiped sideways (D06's one allowed horizontal scroll). The handle sits
 * in each card's lower corner.
 */
const POSTS = [
  { src: "/images/worn/arca-i-k-black-1.webp", alt: "ARCA I in K Black, worn" },
  { src: "/images/worn/patriarca-midnight-noir-1.webp", alt: "PATRIARCA in Midnight Noir, worn" },
  { src: "/images/worn/ahava-rose-1.webp", alt: "AHAVA in Rose, worn" },
  { src: "/images/worn/arca-ii-noir-1.webp", alt: "ARCA II in Noir, worn" },
  { src: "/images/worn/matriarca-brown-1.webp", alt: "MATRIARCA in Brown, worn" },
  { src: "/images/worn/arca-i-z-white-1.webp", alt: "ARCA I in Z White, worn" },
  { src: "/images/worn/patriarca-black-1.webp", alt: "PATRIARCA in Black, worn" },
  { src: "/images/worn/arca-ii-dark-tortoise-1.webp", alt: "ARCA II in Dark Tortoise, worn" },
] as const;


export function HomeSocial() {
  const ig = menu.contact.instagram;
  return (
    <section aria-labelledby="social-heading" className="on-ink bg-ink py-24 sm:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 sm:flex-row sm:items-end sm:justify-between sm:px-10">
        <div className="flex flex-col gap-3">
          <p className="t-eyebrow text-paper/70">Instagram</p>
          <h2 id="social-heading" className="t-display-lg text-paper">
            The World of Aria Noir
          </h2>
        </div>
        <CtaLink href={ig.href} external kind="secondary">
          Follow the house
        </CtaLink>
      </div>

      {/* Swiped sideways at every width (Rems, 23 Nov). The row bleeds to
          the edges of the screen like the site's other side-scrolling
          rows, and takes the page gutter as padding so the first card
          starts on that line and the last runs off the right. `scroll-px`
          carries the same gutter into the snap, so a snapped card lands
          on the gutter and not against the glass. */}
      <ul
        className="tiles-scroll mt-12 flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-px-6 px-6 sm:scroll-px-10 sm:px-10"
        style={{ scrollbarWidth: "none" }}
      >
        {POSTS.map((p) => (
          <li
            key={p.src}
            className="social-card relative shrink-0 snap-start"
          >
            <a
              href={ig.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label={`${p.alt}. Aria Noir on Instagram`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="lazy" className="block w-full object-cover" style={{ aspectRatio: "4 / 5" }} />
              <span
                className="t-caption absolute bottom-3 left-3 text-paper"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
              >
                @arianoir_official
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
