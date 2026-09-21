/**
 * El Patrón's photography, from the shoot into the build.
 *
 * Run: node scripts/import-alpaca-photography.mjs
 *
 * ---- Why an import step ----
 *
 * The shoot delivers jpegs of 0.7–3MB each, at whatever size the render
 * came out. The build serves webp, and a garment page that shipped three
 * megabytes of hero would undo every gram saved on the eyewear heroes. So
 * the originals stay where they are — outside the app, untouched, the thing
 * to go back to — and this writes the web copy.
 *
 * ---- What the names mean ----
 *
 *   outputs/01-hero/hero-aria-solo-gallery.jpeg
 *        →  public/images/alpaca-sweater/run/hero-aria-solo-gallery.webp
 *
 * The numbered folder is the shoot's own filing (hero, model solo, duo,
 * macro, wide, vibe) and it is dropped: the file names already carry the
 * subject, and a path with `01-` in it reads as an ordering the page does
 * not follow. `run/` rather than `variants/`, because these are the RUN —
 * the garment in its world — not one photograph per colourway. The existing
 * `variants/` set is per-colourway and stays where it is.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(
  ROOT,
  "..",
  "All Assets First Run",
  "aria-noir-alpaca-tweed",
  "outputs",
);
const OUT = path.join(ROOT, "public", "images", "alpaca-sweater", "run");

/** Long edge. Above this nothing on the page can show the extra pixels:
 *  the widest slot a garment photograph lands in is a full-bleed hero on a
 *  2x laptop, which is 2560 device pixels and is served a 1920 source by
 *  next/image anyway. */
const MAX = 2000;
/** webp quality. 82 is where this shoot stops losing anything visible in
 *  the knit — the macro is the test, since a woven texture is the first
 *  thing a codec smooths away. */
const Q = 82;

const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
    );

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Source not found: ${SRC}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const files = walk(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  let saved = 0;
  let before = 0;
  let after = 0;

  for (const f of files) {
    const stem = path.basename(f).replace(/\.[^.]+$/, "");
    const out = path.join(OUT, `${stem}.webp`);
    const src = await sharp(f);
    const m = await src.metadata();
    await sharp(f)
      .resize({
        width: m.width >= m.height ? MAX : undefined,
        height: m.height > m.width ? MAX : undefined,
        withoutEnlargement: true,
      })
      .webp({ quality: Q })
      .toFile(out);

    const b = fs.statSync(f).size;
    const a = fs.statSync(out).size;
    before += b;
    after += a;
    saved += 1;
    const dim = await sharp(out).metadata();
    console.log(
      `  ✓ ${stem}.webp  ${dim.width}x${dim.height}  ${Math.round(b / 1024)}kb → ${Math.round(a / 1024)}kb`,
    );
  }

  console.log(
    `\n${saved} image(s) → ${path.relative(ROOT, OUT)}  ` +
      `(${Math.round(before / 1024 / 1024)}MB → ${Math.round(after / 1024 / 1024)}MB)`,
  );
}

main();
