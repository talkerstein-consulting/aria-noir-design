/**
 * The houses' CLOSEUP passes, into `public/`.
 *
 * Run: node scripts/import-closeup-photography.mjs [--src <dir>]
 *
 * ---- Why these are not part of the campaign import ----
 *
 * `import-campaign-photography` reads the shoot's numbered folders and
 * files each by its number — `04-macro`, `05-colorway`, and so on. The
 * closeups are not in that scheme: MATRIARCA delivered them under `v2/
 * closeup` and MONARCA under `outputs-v5/closeups`, both outside the
 * numbered set, so the campaign script walked straight past them and the
 * spec sections of those two pages were left standing on `*-sill` frames —
 * the whole object on a windowsill, which is a product still and not a
 * detail of anything.
 *
 * ---- Which pass wins ----
 *
 * MONARCA's closeups exist in v4 and v5 with the same basenames. The
 * highest version is the finished one and the earlier is its draft, so the
 * walk takes them in version order and a later file overwrites an earlier
 * one of the same name. That is the rule the campaign import already runs
 * on; it is repeated here rather than shared because the two scripts read
 * different source shapes and a common walker would have to be told which
 * shape it was looking at anyway.
 *
 * ---- Where they land ----
 *
 * `public/images/<house>/closeup/<name>.webp`, a folder of their own
 * beside `campaign/` and `variants/`. Not merged into `campaign/`: the
 * spec section asks for exactly these frames and a caller should be able
 * to say so in the path.
 */
import { mkdir, readdir } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_SRC = path.join("..", "All Assets First Run");
const OUT = path.join("public", "images");

/** Long edge and quality, matching the campaign import — one column of
 *  plates should be one encode. */
const LONG_EDGE = 1920;
const QUALITY = 82;

/** house slug → the delivered folders holding its closeups, in version
 *  order, earliest first. */
const SOURCES = {
  matriarca: ["aria-noir-matriarca/v2/closeup"],
  monarca: [
    "aria-noir-monarca/outputs-v4/closeups",
    "aria-noir-monarca/outputs-v5/closeups",
  ],
};

const args = process.argv.slice(2);
const SRC = args.includes("--src") ? args[args.indexOf("--src") + 1] : DEFAULT_SRC;

async function main() {
  for (const [house, dirs] of Object.entries(SOURCES)) {
    const out = path.join(OUT, house, "closeup");
    await mkdir(out, { recursive: true });
    console.log(`\n${house}`);

    for (const rel of dirs) {
      const dir = path.join(SRC, rel);
      if (!fs.existsSync(dir)) {
        console.log(`  (skipped, not delivered: ${rel})`);
        continue;
      }
      for (const file of (await readdir(dir)).sort()) {
        if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
        const stem = file.replace(/\.[^.]+$/, "");
        const dest = path.join(out, `${stem}.webp`);
        await sharp(path.join(dir, file))
          .resize({
            width: LONG_EDGE,
            height: LONG_EDGE,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: QUALITY })
          .toFile(dest);
        const m = await sharp(dest).metadata();
        console.log(
          `  ✓ ${stem}.webp  ${m.width}x${m.height}  ${Math.round(fs.statSync(dest).size / 1024)}kb`,
        );
      }
    }
  }
}

main();
