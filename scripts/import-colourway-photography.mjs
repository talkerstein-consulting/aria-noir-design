/**
 * Bring the storefront's per-colourway photography into `public/`, and print
 * the catalogue wiring it makes possible.
 *
 * ---- Why this exists ----
 *
 * `/shop/[slug]` is one template over `lib/navigation`, so every house has
 * had a buy page from the day the template shipped. What only ARCA I had
 * was a colourway SHOOT — a photograph of each acetate — which is the
 * difference between a buy page for a frame and a buy page for the colour
 * the reader actually chose. The other five fell back to the house plate,
 * so moving the picker changed the caption and nothing else.
 *
 * The shoot exists for all six. It is in the scrape, already reshaped by
 * `scripts/group_colorways.py` into one folder per colourway. This copies
 * that set into `public/images/<house>/variants/` at web weight, and prints
 * the `colorwayPlates` / `colorwayGallery` blocks to paste into
 * `lib/navigation.ts`.
 *
 * ---- What it does NOT do ----
 *
 * It does not touch ARCA I. That house's wiring is hand-curated — semantic
 * filenames, six frames on K Black because the story page's macro set is
 * that colourway, one shot excluded by instruction — and none of that
 * survives being regenerated from a directory listing.
 *
 * It does not invent angle names. The store's order is the only ordering
 * information in the scrape, so files are numbered in it. `-02` means
 * "the second picture the shop shows", not "the side view".
 *
 * It skips `desc-*`, which are the size charts embedded in the product
 * description — a diagram, not a photograph of the frame.
 *
 *   node scripts/import-colourway-photography.mjs [--dry]
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join("scrape", "arianoir", "models", "eyewear");
const OUT = path.join("public", "images");

/** Hand-curated; see the header. */
const SKIP = new Set(["arca-i"]);

/** The long edge, in pixels.
 *
 *  Matches what is already in `public/images/arca-i/variants`. The buy
 *  page's column is square and `object-cover`, so anything wider is
 *  cropped away before it is ever seen — and the sources run to 5040px
 *  and 19MB, which is a page nobody on a phone finishes loading. */
const LONG_EDGE = 1920;
const QUALITY = 82;

const dry = process.argv.includes("--dry");

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Title Case, which is how `colorwayNames` spells what the scrape shouts.
 *  Verified against the catalogue below rather than trusted. */
const titleCase = (s) =>
  s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

async function main() {
  const houses = (await readdir(SRC, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((h) => !SKIP.has(h));

  const wiring = [];

  for (const house of houses) {
    const model = JSON.parse(
      await readFileText(path.join(SRC, house, "model.json")),
    );
    const outDir = path.join(OUT, house, "variants");
    if (!dry) await mkdir(outDir, { recursive: true });

    const plates = {};
    const gallery = {};

    for (const variant of model.variants) {
      const name = titleCase(variant.colorway);
      const from = path.join(SRC, house, "images", variant.slug);
      if (!existsSync(from)) {
        console.warn(`  ! ${house}/${variant.slug}: no images`);
        continue;
      }

      const files = (await readdir(from))
        .filter((f) => !f.startsWith("desc-"))
        .sort();

      const written = [];
      for (const [i, file] of files.entries()) {
        const out = `${variant.slug}-${String(i + 1).padStart(2, "0")}.jpg`;
        const href = `/images/${house}/variants/${out}`;
        written.push(href);
        if (dry) continue;
        await sharp(path.join(from, file))
          /* `inside` and `withoutEnlargement`: the aspect is the
             photographer's, not this script's. The page crops to a square
             at render time, so forcing one here would only throw away
             pixels twice. */
          .resize({
            width: LONG_EDGE,
            height: LONG_EDGE,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: QUALITY, mozjpeg: true })
          .toFile(path.join(outDir, out));
      }

      if (!written.length) continue;
      plates[name] = written[0];
      gallery[name] = written;
      console.log(`  ${house} · ${name}: ${written.length}`);
    }

    wiring.push({ house, plates, gallery });
  }

  const out = wiring
    .map(({ house, plates, gallery }) => {
      const p = Object.entries(plates)
        .map(([k, v]) => `      ${quote(k)}: "${v}",`)
        .join("\n");
      const g = Object.entries(gallery)
        .map(
          ([k, v]) =>
            `      ${quote(k)}: [\n${v.map((s) => `        "${s}",`).join("\n")}\n      ],`,
        )
        .join("\n");
      return `/* ---- ${house} ---- */\n    colorwayPlates: {\n${p}\n    },\n    colorwayGallery: {\n${g}\n    },`;
    })
    .join("\n\n");

  const notePath = path.join("scripts", "colourway-wiring.generated.txt");
  if (!dry) await writeFile(notePath, out, "utf8");
  console.log(`\nWiring for lib/navigation.ts → ${notePath}`);
}

function quote(k) {
  return /^[A-Za-z_$][\w$]*$/.test(k) ? k : `"${k}"`;
}

async function readFileText(p) {
  const { readFile } = await import("node:fs/promises");
  return readFile(p, "utf8");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
