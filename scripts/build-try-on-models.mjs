/**
 * Compress the showcase's second-generation models for the try-on.
 *
 * Source: https://arianoir-showcase.pages.dev/models/gen2/<HOUSE>-<Colourway>.glb
 * (and /models/ARCAI.glb .. ARCAI_4.glb for ARCA I's four cuts). Those are
 * Blender exports at 9-17MB each, uncompressed. This writes them to
 * public/models/try-on at 0.6-1.2MB each: Draco geometry, WebP textures at
 * 2048px. No simplification: it broke the thin faceted fronts (PATRIARCA)
 * into jagged shards.
 *
 *   node scripts/build-try-on-models.mjs <folder of downloaded glbs>
 *
 * The folder should hold the gen2 files and the four ARCAI files, with
 * their showcase names. Requires npx (fetches @gltf-transform/cli@4).
 *
 * Mesh and material names are KEPT: --flatten/--join/--palette are off,
 * because components/try-on/fit.ts finds lenses and nose pads by name.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const OUT = join(root, "public", "models", "try-on");
const SRC = process.argv[2];
if (!SRC || !existsSync(SRC)) {
  console.error("usage: node scripts/build-try-on-models.mjs <folder of downloaded glbs>");
  process.exit(1);
}

/** ARCA I's files are numbered, not named. Read off each body acetate's
 *  colour: near-black, white, brown, blue. */
const ARCA_I = {
  "ARCAI.glb": "arca-i-k-black",
  "ARCAI_2.glb": "arca-i-z-white",
  "ARCAI_3.glb": "arca-i-proceso-brown",
  "ARCAI_4.glb": "arca-i-309-blue",
};

/** Filed as AHAVA-Black, not a colourway the store sells. See the AHAVA
 *  entry in lib/navigation. */
const SKIP = new Set(["AHAVA-Black.glb"]);

/** "ARCA_II-Root_Beer_Float.glb" -> "arca-ii-root-beer-float" */
function outName(file) {
  if (ARCA_I[file]) return ARCA_I[file];
  const [house, colour] = file.replace(/\.glb$/, "").split("-");
  const kebab = (s) => s.toLowerCase().replace(/_/g, "-");
  return `${kebab(house)}-${kebab(colour)}`;
}

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)).map((f) => join(e.name, f)) : [e.name],
  );
}

mkdirSync(OUT, { recursive: true });
for (const rel of files(SRC)) {
  const file = rel.split(/[\\/]/).pop();
  if (!file.endsWith(".glb") || SKIP.has(file)) continue;
  if (!file.includes("-") && !ARCA_I[file]) continue;
  const name = outName(file);
  const args = [
    "--yes", "@gltf-transform/cli@4", "optimize",
    join(SRC, rel), join(OUT, `${name}.glb`),
    "--compress", "draco",
    "--flatten", "false", "--join", "false", "--instance", "false", "--palette", "false",
    "--simplify", "false",
    "--texture-compress", "webp", "--texture-size", "2048",
  ];
  /* npx is a .cmd on Windows, so it needs a shell, and a shell splits a
     path like "C:\Users\Rems 2021\..." at the space unless it is quoted. */
  const win = process.platform === "win32";
  execFileSync("npx", win ? args.map((a) => (/\s/.test(a) ? `"${a}"` : a)) : args, {
    stdio: "inherit",
    shell: win,
  });
  console.log(`${file} -> ${name}.glb`);
}
