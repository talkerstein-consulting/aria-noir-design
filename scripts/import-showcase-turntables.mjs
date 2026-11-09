/**
 * Jai's Blender turntables into public/images/spin/<stem>/.
 *
 *   node scripts/import-showcase-turntables.mjs [--src <folder>] [--only a,b] [--dry]
 *
 * Source: scrape/showcase/turntable/<stem>/0000..0359.webp, one frame per
 * degree at 1600x1014, mirrored from arianoir-showcase.pages.dev by
 * scripts/scrape_showcase.py. Same camera, same start angle and the same
 * direction of turn as the 72-frame set they replace (old frame N is new
 * frame N*5), so nothing downstream changes but the count.
 *
 * ---- 180 frames, not 360 ----
 * A turntable draws every frame it can reach, so it downloads all of them.
 * 360 at full width is ~23MB a colourway; every second degree halves that
 * and still steps 2 degrees per frame, finer than a drag can resolve (the
 * showcase itself serves 180). Width is kept at the full 1600px: Jai asked
 * for the highest resolution, not the lightest.
 *
 * Writes 000.webp..179.webp and replaces the old 00..71.webp in each folder.
 * Only the stems the site already turns (SPIN in spin-plate.tsx) are
 * written; the showcase's extra "X" models are not in the catalogue.
 */
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const STEP = 2; /* degrees per kept frame */
const FRAMES = 360 / STEP;
const QUALITY = 80;
const OUT = path.join("public", "images", "spin");

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const SRC = args.includes("--src") ? args[args.indexOf("--src") + 1] : path.join("scrape", "showcase", "turntable");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;

/* Read off the component, so the list cannot drift from what renders. */
const spinSrc = await import("node:fs").then((fs) =>
  fs.readFileSync(path.join("src", "components", "shop", "spin-plate.tsx"), "utf8"),
);
const block = /export const SPIN = new Set\(\[([\s\S]*?)\]\)/.exec(spinSrc);
const STEMS = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

let done = 0;
const missing = [];
for (const stem of STEMS) {
  if (only && !only.includes(stem)) continue;
  const from = path.join(SRC, stem);
  try {
    await stat(path.join(from, "0000.webp"));
  } catch {
    missing.push(stem);
    continue;
  }
  const to = path.join(OUT, stem);
  if (!dry) {
    await rm(to, { recursive: true, force: true });
    await mkdir(to, { recursive: true });
  }
  let bytes = 0;
  for (let i = 0; i < FRAMES; i++) {
    const src = path.join(from, `${String(i * STEP).padStart(4, "0")}.webp`);
    const dst = path.join(to, `${String(i).padStart(3, "0")}.webp`);
    if (dry) continue;
    const info = await sharp(src).webp({ quality: QUALITY, effort: 5 }).toFile(dst);
    bytes += info.size;
  }
  done++;
  console.log(`${stem}: ${FRAMES} frames, ${(bytes / 1e6).toFixed(1)}MB`);
}
console.log(`\n${done} turntables written.${missing.length ? ` No render for: ${missing.join(", ")}` : ""}`);
