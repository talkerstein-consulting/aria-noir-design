/**
 * Bring the site's photography in from the Phase 1 Arca I and Arca II
 * shoot.
 *
 * ---- Why this exists ----
 *
 * The home page was dressed in `plate-*.jpg`: founders, masked dancers, a
 * studio shadow. Good pictures, but from a different campaign and a
 * different world, and none of them of the frames the page is selling. The
 * house has one shoot now, in two chapters, and the pages should be
 * furnished out of it and nothing else.
 *
 * ---- Why an explicit map rather than a directory sweep ----
 *
 * `import-colourway-photography.mjs` sweeps, because a colourway's plates
 * are interchangeable: any good photograph of Noir will do for Noir. These
 * are not interchangeable. Each slot on the home page has a job — a
 * full-height sticky plate, a 3:4 tile in a falling curtain, a small square
 * dragged behind the pointer — and the crop that a slot will apply decides
 * which frames can go in it. So the pairing is written down, once, here,
 * and the reason travels with it.
 *
 * Several masters in the batch are labelled "do not use" or "wrong" by the
 * studio. Nothing in this map points at one; a sweep would have taken them
 * all.
 *
 *   node scripts/import-arca-photography.mjs
 *
 * Idempotent. Re-running re-encodes from the masters, so the derived files
 * in `public/images/*` can be deleted and rebuilt at any time.
 */
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

/** The delivered batch. Long enough to break Windows' 260-character path
 *  limit once a filename is appended, which is why the masters are read
 *  through an extended-length prefix below. */
const BATCH =
  "F:/ARCHIVE WORK/04 SEAN/210 Aria Noir Arca ii/Phase 1 images for Rems - Arca I and II Batch-20260904T123658Z-1-001/Phase 1 images for Rems - Arca I and II Batch";

/** `\\?\` turns off Win32 path parsing, which is what lifts the 260-char
 *  limit. It needs backslashes and an absolute path to work at all. */
const long = (p) => "\\\\?\\" + path.resolve(p).replace(/\//g, "\\");

/** Nothing on this page is displayed above 1920 on its long edge, and the
 *  masters are 2752 wide. Matches import-colourway-photography.mjs so the
 *  two sets sit at the same weight. */
const LONG_EDGE = 1920;
const QUALITY = 82;

const I = "Arca I";
const II = "Arca II";

/* Each entry: [source, destination, why it is in that slot]. The third
   field is not decoration — it is what stops a later edit putting a
   16:9 environment plate into a 3:4 tile. */
const MAP = [
  /* ---------- Arca I: the brutalist chapter ---------- */
  // figures, 4:5 masters into 3:4 tiles — a 7% crop, nothing lost
  [`${I}/AR model  images - Arca I/Arca 1 - Aria Photoshoot Matrix Brutalist Dress movement shot.png`, "arca-i/home/aria-doorway-coat.jpg", "gallery tile"],
  [`${I}/AR model  images - Arca I/Arca 1 brutalist door long coat bespoke shot.png`, "arca-i/home/noir-doorway-coat.jpg", "gallery tile"],
  [`${I}/AR model  images - Arca I/Arca I - Brutalist - Artsy Avant Garde Image.jpeg`, "arca-i/home/aria-striped-light.jpg", "gallery tile"],
  [`${I}/AR model  images - Arca I/Arca 1 - Aria Photoshoot Matrix Brutalist Zoom In Fisheye.png`, "arca-i/home/aria-fisheye-close.jpg", "gallery tile, frame legible"],
  [`${I}/AR model  images - Arca I/Arca 1 brutalist bust turtleneck closeup.png`, "arca-i/home/noir-bust-close.jpg", "gallery tile, frame legible"],
  [`${I}/AR model  images - Arca I/Arca 1 - Aria Photoshoot Matrix Brutalist Potrait face fisheye.png`, "arca-i/home/aria-face-fisheye.jpg", "pointer trail"],
  [`${I}/AR model  images - Arca I/Arca 1 - Aria Photoshoot Matrix Brutalist Closeup Face bokeh shot.png`, "arca-i/home/aria-bokeh-close.jpg", "pointer trail"],
  [`${I}/AR model  images - Arca I/Arca 1 brutalist closeup fisheye turtle neck desaturated.png`, "arca-i/home/noir-fisheye-desat.jpg", "pointer trail"],
  [`${I}/AR model  images - Arca I/Arca 1 brutalist door bust shot bokeh desaturated.png`, "arca-i/home/noir-door-bokeh.jpg", "pointer trail"],

  // the object alone, in the building
  [`${I}/Hero product images/ARCA 1 GLASSES PORTAIT.png`, "arca-i/home/frame-portrait.jpg", "gallery tile"],
  [`${I}/Hero product images/ARCA 1 CLOSEUP.png`, "arca-i/home/frame-macro-concrete.jpg", "atelier pair, square master crops evenly"],
  [`${I}/Hero product images/Arca 1 brutalist window shadow arca 1 product only.png`, "arca-i/home/frame-window-shadow.jpg", "atelier pair"],
  [`${I}/Hero product images/Arca 1 brutalist portrait arca 1 product only puddle.png`, "arca-i/home/frame-puddle.jpg", "atelier pair"],
  [`${I}/4_5 macro images/Arca 1 macro nose level front.jpeg`, "arca-i/home/macro-nose-front.jpg", "pointer trail"],
  [`${I}/Environment and Wide Shots/Arca 1 brutalist environment stairwell.png`, "arca-i/home/stairwell-spiral.jpg", "pointer trail, square"],

  /* ---------- Arca II: the dark chapter ---------- */
  [`${II}/4_5 AR model  images/34.jpeg`, "arca-ii/home/noir-vaulted.jpg", "gallery tile"],
  [`${II}/4_5 AR model  images/40.jpeg`, "arca-ii/home/aria-cloister.jpg", "gallery tile"],
  [`${II}/4_5 AR model  images/36.png`, "arca-ii/home/aria-close-dark.jpg", "gallery tile"],
  [`${II}/4_5 AR model  images/26.png`, "arca-ii/home/aria-dark-coat.jpg", "pointer trail, 9:16 master"],
  /* The sticky plate. 1536x2752 is the only aspect on the page that suits a
     column running the full height of the viewport, and this is the one
     picture in the batch that is BOTH that shape and about the object on a
     face rather than beside one. */
  [`${II}/Macro Images/33.png`, "arca-ii/home/eye-macro.jpg", "atelier sticky plate, 9:16"],
  /* The gold. 16:9 into a 3:4 tile is the heaviest crop in this map, taken
     deliberately: the Deco plate sits dead centre of the master, and it is
     the only photograph of the inlay that exists. */
  [`${II}/Macro Images/Arca II - Macro Middle.png`, "arca-ii/home/gold-plate-macro.jpg", "atelier pair, centre crop"],

  /* ---------- the eyewear index ----------

     Two jobs, and they want opposite masters.

     A `ground` is the full-bleed plate behind a turning frame, and
     ModelStage fetches it at 96px and blurs it (see PLATE_SIZES there): it
     is read as light and shape, never as a picture. So the wides go here,
     chosen for the structure of their light rather than their subject, and
     both of them happen to be the pair in the place, which is what the
     page is about.

     A grid card is 4:5 and sharp, so it takes a native 4:5 master. These
     are the only sharp lifestyle photographs on the page. */
  [`${I}/16_9 Banner model images/Aria and Noir Rooftop.jpeg`, "arca-i/lifestyle/pair-rooftop.jpg", "ARCA I ground, 16:9 blurred"],
  [`${I}/AR model  images - Arca I/Arca 1 - Aria Photoshoot Matrix Brutalist Perspective Low Angle.png`, "arca-i/lifestyle/aria-low-angle.jpg", "ARCA I grid card, 4:5"],
  [`${II}/16_9 Banner model images/13.png`, "arca-ii/lifestyle/pair-doorway.jpg", "ARCA II ground, 16:9 blurred"],
  [`${II}/4_5 AR model  images/33.jpeg`, "arca-ii/lifestyle/noir-cloister.jpg", "ARCA II grid card, 4:5"],
];

const OUT = path.join("public", "images");

let written = 0;
for (const [src, dest, why] of MAP) {
  const from = path.join(BATCH, src);
  if (!existsSync(long(from))) {
    console.error(`MISSING master: ${src}`);
    process.exitCode = 1;
    continue;
  }

  const to = path.join(OUT, dest);
  mkdirSync(path.dirname(to), { recursive: true });

  const info = await sharp(long(from))
    /* `inside` never enlarges and never crops: the slot's own object-cover
       decides the crop at render, at the size it is actually displayed. */
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(to);

  written++;
  console.log(
    `${dest.padEnd(38)} ${(info.width + "x" + info.height).padEnd(10)} ${(info.size / 1024 | 0)}KB   ${why}`,
  );
}

console.log(`\n${written} of ${MAP.length} written`);
