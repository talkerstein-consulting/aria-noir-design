/**
 * One-off asset pipeline for the ARCA II shoot, the sibling of
 * build-arca-images.mjs.
 *
 * The delivery is ~170MB of PNG/JPEG on an archive drive, sorted by SHAPE
 * (16:9 banners, 4:5 portraits, macro, product, environment) rather than by
 * where anything goes. This file is the map from that shape to the slots
 * the ARCA II page actually has — which is the thing worth keeping, since
 * the drive is not on every machine and the names in it are camera numbers.
 *
 * Run: node scripts/build-arca-ii-images.mjs
 *
 * Same terms as the ARCA I script: `sharp` resolves transitively through
 * next, this is not wired into the build, and you re-run it when the shoot
 * changes rather than on every deploy.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC =
  "F:/ARCHIVE WORK/04 SEAN/210 Aria Noir Arca ii/Arca II-20260903T131329Z-1-001/Arca II";
const OUT = path.join(process.cwd(), "public/images/arca-ii");

const BANNER = "16_9 Banner model images";
const AR = "4_5 AR model  images"; // two spaces, as delivered
const COLOUR = "Colorways";
const HERO = "Hero product images";
const MACRO = "Macro Images";
const WIDE = "Wide Artsy & Environment Photos";

/**
 * source file → published slug.
 *
 * The slugs are the ones the page already asks for (lib/arca-ii.ts), so
 * this is a REPLACEMENT rather than a second set: nothing has to be
 * re-wired, and the old plates are overwritten in place.
 */
const PLATES = {
  /* The opening. The two of them, front on, in the dark — the only frame in
     the delivery that introduces both models at once. */
  [`${BANNER}/13.png`]: "hero-arca",

  /* The building, before anyone is in it. */
  [`${WIDE}/6.jpeg`]: "structure-stair",
  [`${WIDE}/9.jpeg`]: "structure-door",
  [`${WIDE}/7.jpeg`]: "detail-lightfall",

  /* The two portraits the page names — Aria, then Noir, both front on
     against carved stone. */
  [`${AR}/26.png`]: "aria",
  [`${AR}/27.png`]: "noir",
  [`${AR}/36.png`]: "meaning-aria-deco",

  /* The pair, at distance. */
  [`${BANNER}/1.jpeg`]: "shoot-pair-door",
  [`${BANNER}/35.jpeg`]: "shoot-pair-bands",
  [`${WIDE}/2.jpeg`]: "worn-pair-corridor",

  /* The object, and the three macros the spec block reads from. */
  [`${HERO}/Arca II Noir.png`]: "object-front",
  [`${HERO}/6.png`]: "offering-frame",
  [`${MACRO}/33.png`]: "spec-macro-eye-gold",
  [`${MACRO}/Arca II - Macro Middle.png`]: "spec-macro-eye",
  [`${MACRO}/Arca II - Macro Shot Left Side.png`]: "spec-macro-temple",

  /* Worn, in the three columns the gallery runs. */
  [`${AR}/34.jpeg`]: "worn-noir-front",
  [`${AR}/22.png`]: "worn-noir-profile",
  [`${AR}/16.png`]: "worn-noir-edge",
  [`${AR}/33.jpeg`]: "worn-noir-panel",
  [`${AR}/40.jpeg`]: "worn-aria-doorway",
  [`${AR}/21.png`]: "worn-aria-panel",
  [`${AR}/39.jpeg`]: "worn-aria-concrete",
  [`${AR}/38.jpeg`]: "worn-aria-trench",
};

/**
 * The colourway run, shot one frame per acetate on the same sill.
 *
 * Published as `variants/<slug>-sill.jpg` rather than into the numbered
 * `-01/-02` set, which is the STOREFRONT's own photography imported by
 * import-colourway-photography.mjs. Two sources, two namespaces: a
 * re-import must not silently overwrite the campaign's frames.
 */
const COLOURWAYS = {
  "Arca II Caramel.png": "caramel-stripe",
  "Arca II Dark Tortoise.png": "dark-tortoise",
  "Arca II Dreamy Rose.png": "dreamy-rose",
  "Arca II Noir.png": "noir",
  "Arca II Pixie Dust.png": "pixie-dust",
  "Arca II Root Beer.png": "root-beer-float",
  "Arca II Tutti Fruti.png": "tutti-frutti",
  "Arca II Velvet Rose.png": "velvet-rose",
};

async function convert(from, to) {
  const info = await sharp(from)
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(to);
  console.log(
    `${path.relative(OUT, to).split(path.sep).join("/")}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}kb`,
  );
}

await mkdir(path.join(OUT, "variants"), { recursive: true });

for (const [file, slug] of Object.entries(PLATES)) {
  await convert(path.join(SRC, file), path.join(OUT, `${slug}.jpg`));
}
for (const [file, slug] of Object.entries(COLOURWAYS)) {
  await convert(path.join(SRC, COLOUR, file), path.join(OUT, "variants", `${slug}-sill.jpg`));
}

console.log(
  `\nDone — ${Object.keys(PLATES).length} plates and ${Object.keys(COLOURWAYS).length} colourways → public/images/arca-ii/`,
);
