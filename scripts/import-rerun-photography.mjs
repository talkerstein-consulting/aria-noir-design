/**
 * Bring the "2nd Rerun" shoot into `public/` at web weight.
 *
 *   node scripts/import-rerun-photography.mjs [--src <folder>] [--dry]
 *
 * The rerun is filed differently from "All Assets First Run" (which
 * import-campaign-photography.mjs reads): one folder per house named
 * "<House> Fresh Batch - Sep 18 2026", roles as numbered folders
 * (01-face-fill, 02-detail, 03-medium, 04-wide, 05-environment,
 * 06-eyewear-only / garment-only, 07-duo, 08-variation/<Colour>/, plus a
 * nested "<House> Creative Tier"/09-creative), and a few loose JPEGs at the
 * house root. MONARCA keeps the first run's names (02-model-4x5, 04-macro,
 * 05-colorway...).
 *
 * Every frame lands in public/images/<slug>/rerun/<role>/<stem>.webp, named
 * for its role and what it shows. Nothing already wired is overwritten. The
 * catalogue (lib/navigation.ts, lib/<house>.ts, lib/apparel.ts) is
 * hand-edited and chooses from these, so this script only writes the files
 * and a manifest (scripts/rerun-manifest.json) with every frame's size.
 */
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DEFAULT_SRC = "C:/Users/Rems 2021/Downloads/2nd Rerun";
const OUT = path.join("public", "images");
const LONG_EDGE = 2400; /* matches the lookbook plates */
const QUALITY = 82;

const HOUSES = {
  Ahava: "ahava",
  "Alpaca Sweater": "alpaca-sweater",
  Matriarca: "matriarca",
  Monarca: "monarca",
  Patriarca: "patriarca",
};

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const SRC = args.includes("--src") ? args[args.indexOf("--src") + 1] : DEFAULT_SRC;

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** "05-colorway 2" -> "colorway-2", "Ahava Creative Tier - Sep 18 2026" -> null (descend). */
function roleOf(dir) {
  if (/creative tier/i.test(dir)) return null;
  return slug(dir.replace(/^\d+-/, ""));
}

async function walk(dir, parts = []) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const r = roleOf(e.name);
      out.push(...(await walk(full, r ? [...parts, r] : parts)));
    } else if (/\.(jpe?g|png)$/i.test(e.name)) {
      out.push({ full, role: parts.length ? parts.join("/") : "loose", stem: slug(e.name.replace(/\.[^.]+$/, "")) });
    }
  }
  return out;
}

async function main() {
  const manifest = {};
  let n = 0;
  for (const [name, house] of Object.entries(HOUSES)) {
    const root = path.join(SRC, `${name} Fresh Batch - Sep 18 2026`);
    try {
      await stat(root);
    } catch {
      console.warn(`skip ${house}: no ${root}`);
      continue;
    }
    const files = await walk(root);
    manifest[house] = [];
    for (const f of files.sort((a, b) => (a.role + a.stem).localeCompare(b.role + b.stem))) {
      const to = path.join(OUT, house, "rerun", ...f.role.split("/"), `${f.stem}.webp`);
      let info = { width: 0, height: 0 };
      if (!dry) {
        await mkdir(path.dirname(to), { recursive: true });
        info = await sharp(f.full)
          .rotate()
          .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(to);
      }
      manifest[house].push({
        src: "/" + to.split(path.sep).slice(1).join("/"),
        role: f.role,
        width: info.width,
        height: info.height,
        from: path.relative(SRC, f.full).split(path.sep).join("/"),
      });
      n++;
      process.stdout.write(`\r${n} frames`);
    }
  }
  console.log();
  if (!dry) await writeFile(path.join("scripts", "rerun-manifest.json"), JSON.stringify(manifest, null, 2));
  for (const [h, list] of Object.entries(manifest)) console.log(`${h}: ${list.length}`);
}

main();
