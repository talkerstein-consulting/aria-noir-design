/**
 * Blender sources → the glb the turntable loads.
 *
 * Run: node scripts/build-colourway-models.mjs
 * Needs: Blender 3.x or 4.x. Set BLENDER=/path/to/blender if it is not in
 * the default macOS location or on PATH.
 *
 * ---- Why a script and not a one-off export ----
 *
 * There are thirty `.blend` files in `3d models/`, one per colourway, and
 * four of the six houses currently ship a SINGLE model that every acetate
 * borrows — so MONARCA's Velvet Rose turns a Noir frame on the buy page.
 * Exporting those by hand is thirty trips through a GUI and a naming
 * convention held in someone's head; the convention belongs here, where
 * `colorwayModels` in lib/navigation can be written against it.
 *
 * ---- The convention ----
 *
 *   3d models/<HOUSE>/<Colourway>.blend  →  public/models/houses/<house>-<colourway>.glb
 *
 * Some files repeat the house in their own name ("AHAVA-Noir.blend"), which
 * is why the house prefix is stripped from the stem before slugging —
 * otherwise the output is `ahava-ahava-noir.glb`, which is exactly the name
 * the one hand-exported AHAVA model already carries today.
 *
 * ---- What the export settings are for ----
 *
 * Draco compression, because these are shipped over the wire to a phone.
 * `+Y up` because that is glTF's convention and three.js assumes it. No
 * cameras or lights: the scene on the site brings its own rig (see
 * components/product/product-model), and an exported studio light would be
 * a second, invisible one fighting it.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "3d models");
const OUT = path.join(ROOT, "public", "models", "houses");

/** Folder name in `3d models/` → the house slug the site uses. */
const HOUSE_DIRS = {
  "AHAVA": "ahava",
  "ARCA I": "arca-i",
  "Arca II": "arca-ii",
  "MATRIARCA": "matriarca",
  "MONARCA": "monarca",
  "PATRIARCA": "patriarca",
};

const BLENDER =
  process.env.BLENDER ||
  "/Applications/Blender.app/Contents/MacOS/Blender";

const slug = (s) =>
  s
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

/* The export runs INSIDE Blender: `--background --python-expr` opens the
   file headless and writes the glb, one process per source. Slower than one
   process looping, and worth it — a .blend that fails to open takes its own
   run down instead of the other twenty-nine with it. */
const EXPR = (out) =>
  `import bpy;bpy.ops.export_scene.gltf(filepath=r"${out}",export_format="GLB",` +
  `export_draco_mesh_compression_enable=True,export_yup=True,` +
  `export_cameras=False,export_lights=False,use_selection=False)`;

function main() {
  if (!fs.existsSync(BLENDER)) {
    console.error(
      `Blender not found at ${BLENDER}.\n` +
        `Install it (https://www.blender.org/download/) or set BLENDER=/path/to/blender.`,
    );
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const plan = [];
  for (const [dir, house] of Object.entries(HOUSE_DIRS)) {
    const from = path.join(SRC, dir);
    if (!fs.existsSync(from)) continue;
    for (const file of fs.readdirSync(from)) {
      if (!file.toLowerCase().endsWith(".blend")) continue;
      const stem = file.replace(/\.blend$/i, "");
      /* "AHAVA-Noir" → "Noir". The house is already in the output prefix. */
      const bare = stem.replace(new RegExp(`^${dir}[-_ ]+`, "i"), "");
      plan.push({
        src: path.join(from, file),
        out: path.join(OUT, `${house}-${slug(bare)}.glb`),
        label: `${house}/${bare}`,
      });
    }
  }

  if (process.env.DRY_RUN) {
    for (const p of plan) console.log(`${p.label}  →  ${path.relative(ROOT, p.out)}`);
    console.log(`\n${plan.length} file(s). DRY_RUN — nothing written.`);
    return;
  }

  let ok = 0;
  for (const p of plan) {
    try {
      execFileSync(
        BLENDER,
        ["--background", p.src, "--python-expr", EXPR(p.out)],
        { stdio: "pipe" },
      );
      const kb = Math.round(fs.statSync(p.out).size / 1024);
      console.log(`  ✓ ${p.label} → ${path.basename(p.out)} (${kb}kb)`);
      ok += 1;
    } catch (e) {
      console.error(`  ✗ ${p.label}: ${e.message.split("\n")[0]}`);
    }
  }
  console.log(`\n${ok}/${plan.length} exported to ${path.relative(ROOT, OUT)}.`);
}

main();
