/**
 * One-off asset pipeline: the ARCA I shoot ships as 1–17 MB PNGs on an
 * archive drive. Convert the selected frames to progressive JPEG, capped at
 * 2000px on the long edge, into public/images/arca-i/.
 *
 * Run: node scripts/build-arca-images.mjs
 *
 * Reads from an archive drive that only exists on the machine the shoot was
 * delivered to, so this is a one-off you re-run when plates change, not part
 * of the build. `sharp` is not a declared dependency either — it resolves
 * transitively through next's own image optimisation. If that ever stops
 * being true, `npm i -D sharp` rather than wiring this into the build.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "F:/ARCHIVE WORK/04 SEAN/184 Aria Noir Product";
const OUT = path.join(process.cwd(), "public/images/arca-i");

/** source basename → published slug */
const PLATES = {
  "ARIA NOIR ARCA 1.png": "hero-ascent",
  "ARIA NOIR ARCA 1 (5).png": "hero-wide",
  "ARIA NOIR ARCA 1 (2).png": "pair-corridor",
  "ARIA NOIR ARCA 1 (6).png": "worn-corridor",
  "ARIA NOIR ARCA 1 (7).png": "worn-threshold",
  "ARIA NOIR ARCA 1 (16).png": "worn-bokeh",
  "ARIA NOIR ARCA 1 (10).png": "object-front",
  "ARIA NOIR ARCA 1 (27).png": "object-rain",
  "ARIA NOIR ARCA 1 (28).png": "object-lightshaft",
  "ARIA NOIR ARCA 1 (29).png": "object-stair",
  "ARIA NOIR ARCA 1 (25).png": "macro-lens",
  "ARIA NOIR ARCA 1 (26).png": "object-shadow",
  // second pass — depth for the three-column gallery
  "ARIA NOIR ARCA 1 (1).png": "worn-lean",
  "ARIA NOIR ARCA 1 (9).png": "object-lowangle",
  "ARIA NOIR ARCA 1 (11).png": "worn-lanterns",
  "ARIA NOIR ARCA 1 (13).png": "worn-passage",
  "ARIA NOIR ARCA 1 (14).png": "worn-stride",
  "ARIA NOIR ARCA 1 (19).png": "worn-backlit",
  "ARIA NOIR ARCA 1 (21).png": "worn-face",
  "ARIA NOIR ARCA 1 (22).png": "worn-vault",
  "ARIA NOIR ARCA 1 (23).png": "worn-close",
};

await mkdir(OUT, { recursive: true });

for (const [file, slug] of Object.entries(PLATES)) {
  const from = path.join(SRC, file);
  const to = path.join(OUT, `${slug}.jpg`);
  const info = await sharp(from)
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(to);
  console.log(`${slug}.jpg  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}kb`);
}

console.log(`\nDone — ${Object.keys(PLATES).length} plates → public/images/arca-i/`);
