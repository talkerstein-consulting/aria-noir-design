import Image from "next/image";
import Link from "next/link";
import { CtaLink } from "@/components/cta-link";
import { CATALOGUE } from "@/lib/catalogue";
import { allHouses, shopPath } from "@/lib/navigation";
import { formatPrice, swatchFor } from "@/lib/shop";
import { pieces } from "@/lib/shop-all";
import { CollectionTiles, type CollectionTile } from "@/components/home/collection-tiles";
import { turntableStem } from "@/lib/turntable";

/**
 * The home page, October v2. Rhythm after DITA: a full-screen picture, then
 * the collections, then one collection given the whole screen, then the
 * frames themselves, isolated. Each section is its own export so the order
 * lives in one place (`app/page.tsx`).
 */

/* ── The full-bleed stage (hero, featured) ─────────────────────────────

   Desktop: the photograph fills the screen and the words stand on a black
   gradient at its foot.

   Phone: a full-height slice of a 16:9 photograph cannot hold two people
   standing apart, so the phone gets its own crop, framed so nobody is cut,
   in a box of that crop's proportions. The words sit underneath on black,
   and the picture fades into them. */

function Stage({
  desktop,
  phone,
  phoneAspect,
  alt,
  priority = false,
  children,
}: {
  desktop: string;
  phone: string;
  phoneAspect: string;
  alt: string;
  priority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="relative w-full bg-ink lg:h-[100svh] lg:min-h-[560px] lg:overflow-hidden">
      <div className={`relative w-full ${phoneAspect} lg:absolute lg:inset-0 lg:aspect-auto`}>
        <picture>
          <source media="(max-width: 1023px)" srcSet={phone} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktop}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {/* The black the words stand on (desktop), the fade into them (phone). */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink to-transparent lg:h-[55%] lg:via-ink/70"
        />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 pt-6 pb-14 text-center sm:px-10 lg:absolute lg:inset-x-0 lg:bottom-0 lg:gap-6 lg:pt-0 lg:pb-20">
        {children}
      </div>
    </section>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */

export function HomeHero() {
  return (
    <Stage
      desktop="/images/home/hero-2560.webp"
      phone="/images/home/hero-m.webp"
      phoneAspect="aspect-[4/5]"
      alt="Aria and Noir, together, in ARCA I"
      priority
    >
      <h1 className="t-display-xl max-w-3xl text-paper rise-now">Frame your mind.</h1>
      <CtaLink href="/collections" className="rise-now">
        The collections
      </CtaLink>
    </Stage>
  );
}
/* ── Statement ──────────────────────────────────────────────────────
   A heading and two sentences. No CTA, no pictures: the words are the
   section. */

export function HomeStatement() {
  return (
    <section aria-labelledby="statement-heading" className="on-ink bg-ink px-6 py-24 sm:px-10 sm:py-36">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <h2 id="statement-heading" className="t-display-lg text-paper rise">
          Made to hold a gaze.
        </h2>
        <p className="t-body t-body--lede max-w-xl text-paper/70 rise">
          Each frame begins with proportion, material, and restraint. Cut from Italian acetate and
          finished by hand, every line has a reason to remain.
        </p>
      </div>
    </section>
  );
}
/* ── Collections: the product photograph of each house, a horizontal 5:4,
      three across in two rows (two across on a phone), no gutter. The
      dots switch the photograph to that colourway (CollectionTiles). ── */

const COLLECTION_ORDER = ["arca-i", "arca-ii", "ahava", "monarca", "matriarca", "patriarca"];

/** The collection tiles' data, in the house order; `exclude` drops one
 *  house (the product page leaves out the one it is selling). */
export function collectionItems(exclude?: string): CollectionTile[] {
  return COLLECTION_ORDER.filter((slug) => slug !== exclude).flatMap((slug) => {
    const house = allHouses.find((h) => h.slug === slug);
    if (!house) return [];
    return [
      {
        slug,
        name: house.name,
        href: house.href ?? shopPath(house),
        image: house.plate ?? `/images/home/collections/${slug}-closeup.webp`,
        colourways: (CATALOGUE[slug] ?? []).map((entry) => ({
          name: entry.colorway,
          swatch: swatchFor(entry.colorway),
          image: pieces.find((p) => p.id === `${slug}/${entry.colorway}`)?.card.image ?? null,
        })),
      },
    ];
  });
}

export function HomeCollections({ scroll = false }: { scroll?: boolean } = {}) {
  const items = collectionItems();
  return (
    <section aria-label="The collections" className="bg-ink">
      <CollectionTiles items={items} scroll={scroll} />
    </section>
  );
}
/* ── Featured collection, full screen ──────────────────────────────── */

export function HomeFeatured() {
  return (
    <Stage
      desktop="/images/home/featured-2560.webp"
      phone="/images/home/featured-m.webp"
      phoneAspect="aspect-[6/5]"
      alt="ARCA II, worn by Aria and Noir in a cloister"
    >
      <h2 className="t-display-xl text-paper rise">ARCA II</h2>
      <p className="t-body t-body--lede max-w-md text-paper/80 rise">
        A darker study in proportion and light. Concrete, shadow, and a single source.
      </p>
      <CtaLink href="/arca-ii" className="rise">
        See ARCA II
      </CtaLink>
    </Stage>
  );
}
/* ── The frames, isolated: four columns ────────────────────────────── */

/* ARCA II only, following the ARCA II feature above it: every colourway the
   store offers, in the store's order. Eight, which fills four by two. The
   cut-out files are named `arca-ii-<colourway slug>`. */
const FRONTS: { file: string; house: string; colorway: string }[] = (CATALOGUE["arca-ii"] ?? []).map(
  (entry) => ({
    file: `arca-ii-${entry.colorway.toLowerCase().replace(/\s+/g, "-")}`,
    house: "arca-ii",
    colorway: entry.colorway,
  }),
);

export function HomeFronts() {
  return (
    /* No heading: the frames are the heading. DITA's rail on a white
       section: the shop's light grey tiles, the frame cut out of its
       render, name and price inside. */
    <section aria-label="The frames" className="bg-white">
      <FrontTiles house="arca-ii" colorways={FRONTS.map((f) => f.colorway)} />
    </section>
  );
}

/** One light grey tile per colourway: the cut-out front, the quarter view
 *  on hover, name and price inside. Shared by the home page's frames and
 *  the product page's run. Colourways with no render are left out. */
export function FrontTiles({ house: slug, colorways }: { house: string; colorways: readonly string[] }) {
  const house = allHouses.find((h) => h.slug === slug);
  if (!house) return null;
  const tiles = colorways.flatMap((colorway) => {
    const file = turntableStem(slug, colorway);
    return file ? [{ colorway, file }] : [];
  });
  return (
    <ul className="grid grid-cols-2 gap-px bg-white lg:grid-cols-4">
      {tiles.map((f) => {
        const entry = CATALOGUE[slug]?.find((e) => e.colorway === f.colorway);
        return (
          <li key={f.file} className="rise shop-tile">
            <Link
              href={`${shopPath(house)}?colourway=${encodeURIComponent(f.colorway)}`}
              className="group relative block aspect-square w-full"
            >
              <Image
                src={`/images/fronts-cut/${f.file}.webp`}
                alt={`${house.name}, ${f.colorway}, from the front`}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-contain p-[8%] pb-[34%] max-sm:scale-[1.3] max-sm:-translate-y-[2%] sm:pb-[22%] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-0 group-focus-visible:opacity-0"
              />
              {/* On hover, the quarter view: turntable frame 014. */}
              <Image
                src={`/images/fronts-cut/${f.file}-quarter.webp`}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-contain p-[8%] pb-[34%] max-sm:scale-[1.3] max-sm:-translate-y-[2%] sm:pb-[22%] opacity-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-3 pb-4 text-center sm:px-4 sm:pb-8">
                <p className="font-display text-lg leading-tight text-ink sm:text-2xl">
                  {house.name}{" "}
                  {/* Own line on a phone, so a long colourway never wraps into the frame. */}
                  <span className="block italic sm:inline">{f.colorway}</span>
                </p>
                {entry ? (
                  <p className="t-caption tabular-nums text-ink/65">{formatPrice(entry.cents)}</p>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}