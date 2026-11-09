/**
 * The About section's pages: Press, Careers, Craftsmanship, Registration.
 *
 * Added 8 Nov 2026 from Jai's website review (5 Nov) and the team call the
 * same day. The section is labelled About, with tabs for About, Heritage
 * and Craftsmanship (components/page/about-tabs). Copy obeys
 * COPY.md: no em-dashes, short, declarative.
 *
 * ---- What is NOT claimed ----
 *
 * The review lists claims with no proof on file: 18K gold, CE, UV400,
 * Rx-ready, an unqualified "handmade", "sustainable". None appears here.
 * "NFT" is kept out of our own copy; it survives only inside two press
 * headlines below, which are citations of what an outlet printed.
 */

/* ── Press ────────────────────────────────────────────────────────────

   From the house's own press list (arianoir-showcase.pages.dev/about/#press,
   read 8 Nov 2026). A plain dated list, newest first. No logo wall and no
   "As seen in": the review keeps that for genuine editorial, and most of
   these are placements or a wire release.

   Merged rather than repeated:
   - The Kyiv release ran on ACCESS Newswire, was picked up by Yahoo Finance
     and carried on the Bloomberg Terminal through the wire. One entry,
     linked to the readable copy, with the wire and the terminal named as
     what they were.
   - California Business Journal and Cali Post ran the same story; so did
     New York Weekly and New York Feature. One entry each, with the second
     outlet listed as a syndication. */

export type PressItem = {
  /** ISO date, or null where the house's list gives none. */
  date: string | null;
  outlet: string;
  kind: string;
  headline: string;
  href: string;
  /** Where the same piece also ran. */
  also?: readonly { outlet: string; href?: string; note?: string }[];
  /** The language, where it is not English. */
  language?: string;
};

export const press: {
  title: string;
  line: string;
  intro: string;
  items: readonly PressItem[];
  enquiries: {
    heading: string;
    body: string;
    email: string;
  };
} = {
  title: "Press.",
  line: "What has been written about Aria Noir.",
  intro: "Each entry links to the page as it was published.",
  items: [
    {
      date: "2023-07-21",
      outlet: "designboom",
      kind: "Architecture",
      language: "Spanish",
      headline:
        "Prima Arquitectura + Aria Noir create a modular house capable of being transported and assembled anywhere",
      href: "https://designboom.es/arquitectura/prima-arquitectura-aria-noir-crean-la-casa-modular-capaz-de-transportarse-y-armarse-en-cualquier-sitio-21-07-2023/",
    },
    {
      date: "2023-04-21",
      outlet: "Yahoo Finance",
      kind: "Press release",
      headline: "ARIA NOIR Completes Shooting of Music Video in Kyiv, Ukraine",
      href: "https://finance.yahoo.com/news/aria-noir-completes-shooting-music-201500910.html",
      also: [
        {
          outlet: "ACCESS Newswire",
          href: "https://www.accessnewswire.com/newsroom/en/business-and-professional-services/aria-noir-completes-shooting-of-music-video-in-kyiv-ukraine-750745",
          note: "the original release",
        },
        { outlet: "Bloomberg Terminal", note: "carried through the wire" },
      ],
    },
    {
      date: "2023-02-21",
      outlet: "HNGN",
      kind: "Feature",
      headline: "Forging Ahead into the Metaverse: Aria Noir and Wearable NFTs",
      href: "https://www.hngn.com/articles/246854/20230221/forging-ahead-into-the-metaverse-aria-noir-and-wearable-nfts.htm",
    },
    {
      date: "2023-01-02",
      outlet: "California Business Journal",
      kind: "Feature",
      headline: "Fashion Brand Aria Noir On How Clothing Can Tell Stories Words Can't",
      href: "https://calbizjournal.com/fashion-brand-aria-noir-on-how-clothing-can-tell-stories-words-cant/",
      also: [
        {
          outlet: "Cali Post",
          href: "https://calipost.com/fashion-brand-aria-noir-on-how-clothing-can-tell-stories-words-cant/",
        },
      ],
    },
    {
      date: "2022-08-10",
      outlet: "California Herald",
      kind: "Feature",
      headline: "Fashion Brand Aria Noir Creating Opportunities for Young Creatives",
      href: "https://www.californiaherald.com/fashion-brand-aria-noir-creating-opportunities-for-young-creatives/",
    },
    {
      date: "2022-06-21",
      outlet: "EE Times",
      kind: "Feature",
      headline:
        "Fashion NFTs Aren't Just for the Top Dogs: Boutique Brand Aria Noir is Making Them Their Own",
      href: "https://www.eetimes.com/fashion-nfts-arent-just-for-the-top-dogs-boutique-brand-aria-noir-is-making-them-their-own/",
    },
    {
      date: "2022-05-20",
      outlet: "The American Reporter",
      kind: "Feature",
      headline: "Three Reasons That Aria Noir Stands Out From The Competition",
      href: "https://www.theamericanreporter.com/three-reasons-that-aria-noir-stands-out-from-the-competition/",
    },
    {
      date: "2022-03-17",
      outlet: "New York Weekly",
      kind: "Feature",
      headline: "Aria Noir Model Speaks On the Importance of Designer Clothing in the Age of Fast Fashion",
      href: "https://nyweekly.com/business/aria-noir-model-speaks-on-the-importance-of-designer-clothing-in-the-age-of-fast-fashion/",
      also: [
        {
          outlet: "New York Feature",
          href: "https://nyfeature.com/lifestyle/fashion/aria-noir-model-speaks-on-the-importance-of-designer-clothing-in-the-age-of-fast-fashion/",
        },
      ],
    },
    {
      date: null,
      outlet: "US Reporter",
      kind: "Feature",
      headline: "Aria Noir: Merging NFT and Fashion",
      href: "https://usreporter.com/aria-noir-merging-nft-and-fashion/",
    },
  ],
  enquiries: {
    heading: "Press enquiries.",
    body: "Images, interviews and loans. Write, and the studio answers.",
    /* The repo's own press desk (lib/pages, contact.desks). The showcase
       lists admin@arianoir.com for the same purpose; confirm which. */
    email: "press@arianoir.com",
  },
};

/* ── Careers ──────────────────────────────────────────────────────────

   No roles are listed because none has been given to us. When one opens it
   is added here, by name. Until then the page says so plainly. */

export const careers = {
  title: "Careers.",
  line: "A small house. It grows slowly, and on purpose.",
  body: [
    "There are no open positions today. When a seat opens, it is named here.",
    "Designers, makers and image people may write at any time. Send work, not a résumé.",
  ],
  email: "admin@arianoir.com",
  cta: "Write to the studio",
} as const;

/* ── Craftsmanship ────────────────────────────────────────────────────

   The draft copy from the review (p.18, "The making: draft for frame and
   About pages"), as written. The review files it under "Then", once the
   facts are confirmed with the factory: treat the paragraphs as the
   house's draft until Jai signs them off.

   The film is the house's own factory footage (factory_inside02, the black
   and white cut), re-encoded at web weight into public/video/house. */

export const craftsmanship = {
  title: "Made slowly, on purpose.",
  line: "The making.",
  film: {
    src: "/video/house/making.mp4",
    poster: "/video/house/making-poster.webp",
    alt: "Inside the workshop: acetate on the mill, the frame in a hand",
  },
  paragraphs: [
    "Each ARIA NOIR frame begins as a solid block of cellulose acetate, a plant-based material. It is milled to our drawings, not poured into a mould, then shaped, tumbled for days and polished by hand.",
    "Our emblem is a separate, gold-plated piece set into the acetate. It needs its own tooling, plating and fitting, which is why our frames can't be made quickly or in bulk.",
    "We don't make many. That's the point. Fewer frames, made properly, meant to be worn for years.",
  ],
  /* The 888. Stated once and not explained: COPY.md asks for exactly one
     thing withheld, and this is it. */
  number: {
    figure: "888",
    line: "Inscribed inside the temple of every frame.",
    note: "It is not explained.",
  },
} as const;

/* ── Registration ─────────────────────────────────────────────────────

   The warranty registration, as a form that hands off to mail the way the
   contact intake does (components/page/contact-intake): there is no
   endpoint behind this build, and a form that pretends to post somewhere
   is worse than one that opens a letter with everything filled in.

   The numbered digital certificate is announced, not offered. The review's
   copy rule: "digital certificate" or "registered edition", never NFT. */

export const registration = {
  title: "Register your frame.",
  line: "Registration records your frame against the warranty.",
  body: [
    "Keep your order number to hand.",
    "A numbered digital certificate of authenticity will follow for every registered frame. It is being prepared.",
  ],
  to: "support@arianoir.com",
  subject: "Frame registration",
  fields: {
    name: "Name",
    email: "Email",
    frame: "Frame",
    colourway: "Colourway",
    order: "Order number",
    date: "Date of purchase",
  },
  send: "Register",
  sent: "Your mail app has the registration ready to send.",
  fallback: "Nothing opened. Write to",
  warrantyLink: { label: "Read the warranty", href: "/policies/warranty" },
} as const;
