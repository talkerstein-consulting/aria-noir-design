/**
 * Export the Blender sources in `3d models/` to web-ready glTF.
 *
 * The eyewear turntable loads .glb. The house's 3D set is .blend — a
 * Blender project file, not an interchange format: it has no reader in a
 * browser and never will. Two of the six houses have been through this
 * conversion already (ARCA, AHAVA, in public/models); the other four have
 * not, which is why four of the nine frames turn on an empty stage.
 *
 * This is the missing step, not a new idea — Blender does it from the
 * command line, so the only thing standing between the .blend set and a
 * full turntable is running it.
 *
 *   node scripts/export-models.mjs            # every house
 *   node scripts/export-models.mjs MONARCA    # one house
 *
 * Requires Blender on PATH (or BLENDER=/path/to/blender). Nothing else —
 * the glTF exporter ships with Blender.
 *
 * ---- One export per HOUSE, not per colourway ----
 *
 * There are 30 .blend files and six houses. A colourway is the same
 * geometry in a different acetate, so shipping thirty 3MB meshes to change
 * a colour would be thirty downloads to tint one material. The first
 * colourway of each house is exported as the house's shape; recolouring in
 * the browser is a material swap on one loaded mesh and belongs in the
 * stage, not in the asset pipeline.
 *
 * ARCA I is the exception the catalogue already documents: its four
 * "colourways" are four genuinely different cuts, so all four are exported.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const SRC = join(root, "3d models");
/* Their own folder. `public/models/` already holds hand-made exports that
   other pages load with a plain GLTFLoader, and these are Draco-compressed
   — dropping them alongside would silently replace a file that still has a
   consumer expecting uncompressed geometry. */
const OUT = join(root, "public", "models", "houses");
const BLENDER = process.env.BLENDER || "blender";

/** Which .blend of each house becomes the house's mesh. `null` means every
 *  file in the folder is its own frame. */
const PICK = {
  AHAVA: "AHAVA-Noir.blend",
  "ARCA I": null, // four distinct cuts — all of them
  /* All eight, and this is the one place the "one mesh per house" rule
     above does not apply.

     That rule is right when a colourway is a flat colour: tint one loaded
     material in the browser and you are done. ARCA II's run is not flat.
     Dark Tortoise is tortoiseshell, Caramel Stripe and Tutti Frutti are
     laid-up striped acetate, Pixie Dust is flecked. No runtime tint
     produces any of those from Noir, so the pattern has to arrive baked,
     which means it has to arrive as its own export. Eight meshes at about
     870KB, loaded one at a time as the reader picks. */
  "Arca II": null,
  MATRIARCA: "Midnight Noir.blend",
  MONARCA: "MONARCA-Noir.blend",
  PATRIARCA: "Midnight Noir.blend",
};

/** Blender runs this in-process with the .blend already open. Selecting
 *  nothing and exporting the whole scene is deliberate: these files are one
 *  frame each, and an export filtered to the selection silently ships an
 *  empty glb when the file was saved with nothing selected. */
const EXPORT_PY = `
import bpy, sys
out = sys.argv[sys.argv.index('--') + 1]
bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    export_apply=True,          # bake modifiers — subsurf is not a web feature
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_yup=True,
)
`;

function slug(house, file) {
  const base = file.replace(/\.blend$/i, "");
  return `${house}-${base}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function main() {
  if (!existsSync(SRC)) {
    console.error(`No source folder at ${SRC}`);
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const script = join(OUT, ".export.py");
  writeFileSync(script, EXPORT_PY);

  const only = process.argv[2];
  const houses = readdirSync(SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((h) => !only || h.toLowerCase() === only.toLowerCase());

  if (!houses.length) {
    console.error(`No house folder matching "${only}"`);
    process.exit(1);
  }

  const written = [];
  for (const house of houses) {
    const pick = PICK[house];
    const files = readdirSync(join(SRC, house))
      .filter((f) => f.toLowerCase().endsWith(".blend"))
      .filter((f) => !pick || f === pick);

    if (!files.length) {
      console.warn(`  ${house}: nothing to export (looked for ${pick})`);
      continue;
    }

    for (const file of files) {
      const out = join(OUT, `${slug(house, file)}.glb`);
      process.stdout.write(`  ${house}/${file} → ${out}\n`);
      try {
        execFileSync(
          BLENDER,
          ["-b", join(SRC, house, file), "-P", script, "--", out],
          { stdio: "inherit" },
        );
        written.push(out);
      } catch (err) {
        console.error(`  FAILED: ${file}`, err.message);
      }
    }
  }

  console.log(`\n${written.length} file(s) written to public/models.`);
  console.log(
    "Point each house at its export via `model:` in src/lib/navigation.ts,\n" +
      "and each frame via `model:` in eyewear.frames (src/lib/pages.ts).",
  );
}

main();
