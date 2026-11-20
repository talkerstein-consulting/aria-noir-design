/**
 * Jai's Blender turntables into public/images/spin/<stem>/.
 *
 *   node scripts/import-showcase-turntables.mjs [--src <folder>] [--only a,b]
 *                                               [--step N] [--width N] [--quality N] [--dry]
 *
 * Source: scrape/showcase/turntable/<stem>/0000..0359.webp, one frame per
 * degree at 1600x1014, mirrored from arianoir-showcase.pages.dev by
 * scripts/scrape_showcase.py. Same camera, same start angle and the same
 * direction of turn as the 72-frame set they replace (old frame N is new
 * frame N*5), so nothing downstream changes but the count.
 *
 * ---- 360 frames: one per degree, as the showcase has ----
 * This used to keep every second frame, on the argument that 2 degrees is
 * finer than a drag can resolve and that the showcase served 180 anyway.
 * The second half of that was wrong: the mirror's own report shows 360
 * frames for every one of its 39 sets, and at 180 the turn visibly steps
 * ("this is glitchy … can we not just make it super smooth" — Raviv,
 * 20 Nov; Rems, same day: match the reference).
 *
 * So STEP is 1 and the site now turns at the reference's resolution.
 *
 * ---- AVIF, not WebP ----
 * Measured on AHAVA Black, the heaviest set, at the same 1200px and no
 * visible loss on a turning object: 12.5MB a colourway as WebP q78
 * against 5.8MB as AVIF q60. Dropping WebP's quality instead is not a
 * lever — q78 to q68 saves 6%, because these are photographic
 * environment renders and WebP is already near its floor on them.
 * Encoding costs the same either way, about 250ms a frame.
 *
 * The cost is Safari 15 and older, which cannot read AVIF. The plate
 * carries no fallback today; if those readers matter, the answer is a
 * `<picture>`-style probe in spin-plate.tsx rather than a second copy of
 * every frame on disk.
 *
 * ---- 1200px, not the source's 1600 ----
 * The frame count is what smoothness costs; the frame WIDTH was just
 * waste. The plate renders about 600px across on a 1440 desktop, so 1200
 * covers it at twice the device pixel ratio with nothing visible given
 * up — and during a turn, fine detail cannot be resolved anyway. Measured
 * on AHAVA Black, the heaviest set: 19.4MB a colourway at 1600/q80
 * against 12.4MB at 1200/q78, for the same turn.
 *
 * Jai asked for the highest resolution and 1600 was that answer; this is
 * Rems's call on 20 Nov, with those numbers in front of him. The masters
 * are untouched in scrape/showcase/turntable, so a different width is one
 * re-run away: pass `--width` and `--quality`.
 *
 * It is still not free. 12.4MB a colourway is a lot on a phone, and the
 * plate asks for every frame. The next win is fetching a coarse ring
 * first and filling the rest in on interaction, which is a change to
 * spin-plate.tsx rather than to this script.
 *
 * Writes 000.avif..359.avif and replaces whatever the folder held before.
 * Only the stems the site already turns (SPIN in spin-plate.tsx) are
 * written; the showcase's extra "X" models are not in the catalogue.
 */
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/* Degrees per kept frame. 1 = every frame the render produced, which is
   what the showcase serves. */
const STEP = Number(
  process.argv.includes("--step") ? process.argv[process.argv.indexOf("--step") + 1] : 1,
);
const FRAMES = 360 / STEP;
const arg = (name, fallback) =>
  process.argv.includes(name) ? Number(process.argv[process.argv.indexOf(name) + 1]) : fallback;

/** Served width. The source renders are 1600; see the note above. */
const WIDTH = arg("--width", 1200);
const QUALITY = arg("--quality", 60);
/** Output codec. `--format webp` goes back to the old set. */
const FORMAT = process.argv.includes("--format")
  ? process.argv[process.argv.indexOf("--format") + 1]
  : "avif";
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
  /* Frames the mirror holds truncated. arca-ii-noir/0345.webp is one — 32KB
     of a 50KB file, and truncated inside the source zip itself, so it is
     Jai's export rather than the download. One bad frame used to end the
     whole run. The plate steps to the nearest frame it has, so a hole of a
     degree costs nothing visible; it is named here rather than passed over
     in silence. */
  const bad = [];
  for (let i = 0; i < FRAMES; i++) {
    const src = path.join(from, `${String(i * STEP).padStart(4, "0")}.webp`);
    const dst = path.join(to, `${String(i).padStart(3, "0")}.${FORMAT}`);
    if (dry) continue;
    const pipe = sharp(src).resize({ width: WIDTH, withoutEnlargement: true });
    try {
      const info = await (FORMAT === "avif"
        ? pipe.avif({ quality: QUALITY, effort: 4 })
        : pipe.webp({ quality: QUALITY, effort: 5 })
      ).toFile(dst);
      bytes += info.size;
    } catch {
      bad.push(path.basename(src));
    }
  }
  done++;
  console.log(
    `${stem}: ${FRAMES - bad.length} ${FORMAT} frames at ${WIDTH}px, ${(bytes / 1e6).toFixed(1)}MB` +
      (bad.length ? ` — unreadable in the mirror, skipped: ${bad.join(", ")}` : ""),
  );
}
console.log(`\n${done} turntables written.${missing.length ? ` No render for: ${missing.join(", ")}` : ""}`);
