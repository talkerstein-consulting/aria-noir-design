/**
 * Bring the houses' CAMPAIGN photography into `public/`, and print the
 * catalogue wiring it makes possible.
 *
 * ---- What this is, and how it differs from the colourway import ----
 *
 * `scripts/import-colourway-photography.mjs` brings in the storefront's
 * product stills: the object, front and side, colour by colour. Those are
 * evidence about the thing being bought and they belong in the buy page's
 * left column.
 *
 * This brings in something else entirely. Each house has been shot as its
 * own campaign, in its own world — AHAVA in a Parisian apartment, MONARCA
 * in a faded palazzo, PATRIARCA in imperial Rome, MATRIARCA in Egypt — and
 * those frames are not product stills. They are the argument the four
 * houses without a story page have never had on their buy page.
 *
 * ---- The roles ----
 *
 * The source is filed by numbered folder and the number is the role. This
 * reads the folder's NAME rather than inventing captions:
 *
 *   01-hero          the cover frame
 *   02-model-*       the frame worn, 4:5
 *   03-banner / duo  both figures, 16:9
 *   04-macro         the acetate and the hardware, close
 *   05-colorway      one composition per acetate, 16:9 and 9:16
 *   06 / 07 / wide   the room and the exterior, empty
 *   08-vibe          the world without the product in it
 *   10-creative      the experiments
 *
 * `05-colorway` lands in `variants/` rather than `campaign/`, named
 * `<colourway>-sill.jpg`, because that is exactly what `colorwaySills`
 * already means and ARCA II is already wired that way.
 *
 * ---- Versions ----
 *
 * MONARCA and MATRIARCA were re-shot several times and the source keeps
 * every pass side by side (`outputs`, `outputs-v2`, … `v5`). A later pass
 * replacing an earlier one shows up as the SAME basename in a higher
 * version folder, so the highest version of a given role+basename wins and
 * the rest are dropped. A name that appears in one pass only is kept: those
 * are additions, not replacements.
 *
 *   node scripts/import-campaign-photography.mjs [--dry] [--src <dir>]
 */
import { mkdir, readdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Where the shoot was delivered. Overridable, because it lives outside
 *  the repository and the next drop will land somewhere else. */
const DEFAULT_SRC =
  "F:/ARCHIVE WORK/04 SEAN/224 Aria Noir - Complete/All Assets First Run-20260917T080338Z-1-001/All Assets First Run";

const OUT = path.join("public", "images");

/** Source folder → catalogue slug. The alpaca tweed is apparel and has no
 *  buy page in this build, so it is not imported here. */
const HOUSES = {
  "aria-noir-ahava": "ahava",
  "aria-noir-matriarca": "matriarca",
  "aria-noir-monarca": "monarca",
  "aria-noir-patriarca": "patriarca",
};

/**
 * The shoot's acetate names against the catalogue's.
 *
 * Where the bench and the shop disagree the shop wins, which is the same
 * rule `colorwayNames` already follows: `black` is filed as Dark Tortoise
 * on AHAVA's listing, and `dreamy-rose` is sold there as Rose.
 */
const COLOURWAYS = {
  ahava: {
    black: "Dark Tortoise",
    "caramel-stripe": "Caramel Stripe",
    "dreamy-rose": "Rose",
    noir: "Noir",
    "root-beer-float": "Root Beer Float",
    "tutti-frutti": "Tutti Frutti",
  },
  matriarca: { brown: "Brown", midnightnoir: "Midnight Noir" },
  patriarca: { black: "Black", brown: "Brown", midnightnoir: "Midnight Noir" },
  monarca: {
    "caramel-stripe": "Caramel Stripe",
    "dark-tortoise": "Dark Tortoise",
    "dreamy-rose": "Dreamy Rose",
    noir: "Noir",
    "pixie-dust": "Pixie Dust",
    "tutti-frutti": "Tutti Frutti",
    "velvet-rose": "Velvet Rose",
  },
};

/** The long edge, in pixels, and the quality. Both match
 *  import-colourway-photography so one column of plates is one encode. */
const LONG_EDGE = 1920;
const QUALITY = 82;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const SRC = args.includes("--src") ? args[args.indexOf("--src") + 1] : DEFAULT_SRC;

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Which role a folder holds, read off its name rather than its number.
 *
 * The numbers are not stable across passes — MONARCA's `outputs-v3` files
 * its duo frames under 08 where the first pass used 09 — so the word after
 * the number is the only thing worth matching on.
 */
function roleOf(dir) {
  const d = dir.toLowerCase();
  if (d.includes("colorway")) return "sill";
  if (d.includes("hero") || d.includes("cover")) return "hero";
  if (d.includes("macro")) return "macro";
  if (d.includes("vibe")) return "vibe";
  /* `12-corrected` is a re-render of two creative frames and `11-nighttime`
     is the apartment after dark. Neither is a role of its own; they are more
     of what is already in 10-creative and 02-model. */
  if (d.includes("creative") || d.includes("corrected")) return "creative";
  if (d.includes("nighttime")) return "worn";
  if (d.includes("duo") || d.includes("banner")) return "duo";
  if (d.includes("wide") || d.includes("environment") || d.includes("exterior"))
    return "wide";
  if (d.includes("model") || d.includes("closeup")) return "worn";
  return null;
}

/** A pass's ordinal. `outputs` and the un-suffixed folders are the first
 *  pass; `v2`, `outputs-v3`, `v5` are the later ones. */
function passOf(dir) {
  const m = /v(\d+)$/.exec(dir);
  return m ? Number(m[1]) : 1;
}

/** Walk one house: top-level children are passes, their children are roles. */
async function walkHouse(root) {
  const files = [];
  for (const pass of await readdir(root, { withFileTypes: true })) {
    if (!pass.isDirectory()) continue;
    const passNo = passOf(pass.name);
    const passDir = path.join(root, pass.name);
    for (const role of await readdir(passDir, { withFileTypes: true })) {
      if (!role.isDirectory()) continue;
      const roleDir = path.join(passDir, role.name);
      for (const file of await readdir(roleDir)) {
        if (!/\.(jpe?g|png)$/i.test(file)) continue;
        files.push({
          full: path.join(roleDir, file),
          role: roleOf(role.name),
          pass: passNo,
          stem: slug(file.replace(/\.[^.]+$/, "")),
        });
      }
    }
  }
  return files;
}

async function encode(from, to) {
  if (dry) return;
  await mkdir(path.dirname(to), { recursive: true });
  await sharp(from)
    .rotate()
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(to);
}

async function main() {
  const report = [];

  for (const [folder, house] of Object.entries(HOUSES)) {
    const root = path.join(SRC, folder);
    try {
      await stat(root);
    } catch {
      console.warn(`skip ${house}: no ${root}`);
      continue;
    }

    const files = await walkHouse(root);

    /* Latest pass wins for a repeated role+basename; an unrepeated name is
       an addition and survives regardless of which pass it came from. */
    const best = new Map();
    for (const file of files) {
      if (!file.role) continue;
      const key = `${file.role}/${file.stem}`;
      const prior = best.get(key);
      if (!prior || file.pass > prior.pass) best.set(key, file);
    }

    const campaign = { hero: [], worn: [], duo: [], macro: [], wide: [], vibe: [], creative: [] };
    const sills = {};
    const names = COLOURWAYS[house] ?? {};

    for (const [, file] of [...best].sort(([a], [b]) => a.localeCompare(b))) {
      if (file.role === "sill") {
        /* Two frames of the same setup per acetate, landscape and portrait,
           and both are wanted: the portrait is what a buy page's column
           opens on and the landscape is the campaign's own composition
           across the whole run. MONARCA's set is landscape only and files
           its colourways under the bare name, so the suffix is optional. */
        const m = /^(.*?)(?:-(16x9|9x16))?$/.exec(file.stem);
        const name = names[m[1]];
        if (!name) {
          console.warn(`  ${house}: no catalogue colourway for "${m[1]}"`);
          continue;
        }
        const tall = m[2] === "9x16";
        const to = path.join(
          OUT,
          house,
          "variants",
          `${slug(name)}-${tall ? "tall" : "sill"}.jpg`,
        );
        await encode(file.full, to);
        const src = "/" + to.split(path.sep).slice(1).join("/");
        (sills[name] ??= {})[tall ? "tall" : "sill"] = src;
        continue;
      }
      const to = path.join(OUT, house, "campaign", `${file.role}-${file.stem}.jpg`);
      await encode(file.full, to);
      campaign[file.role].push("/" + to.split(path.sep).slice(1).join("/"));
    }

    report.push({ house, campaign, sills });
  }

  /* The wiring, printed rather than written: `lib/navigation.ts` is a hand
     edited document with a comment on every field, and a script that
     rewrote it would erase the comments. Same arrangement as the colourway
     import. */
  const lines = [];
  for (const { house, campaign, sills } of report) {
    lines.push(`/* ======== ${house} ======== */`);
    if (Object.keys(sills).length) {
      lines.push("colorwayPlates: {");
      for (const [name, set] of Object.entries(sills))
        lines.push(`  ${JSON.stringify(name)}: ${JSON.stringify(set.tall ?? set.sill)},`);
      lines.push("},");
      /* The portrait frame only. `galleryFor` closes every colourway scroll
         with that colourway's sill, so listing the landscape here too would
         be the same picture twice. */
      const tall = Object.entries(sills).filter(([, set]) => set.tall);
      if (tall.length) {
        lines.push("colorwayGallery: {");
        for (const [name, set] of tall)
          lines.push(`  ${JSON.stringify(name)}: [${JSON.stringify(set.tall)}],`);
        lines.push("},");
      }
      lines.push("colorwaySills: {");
      for (const [name, set] of Object.entries(sills))
        if (set.sill) lines.push(`  ${JSON.stringify(name)}: ${JSON.stringify(set.sill)},`);
      lines.push("},");
    }
    lines.push("campaign: {");
    for (const [role, srcs] of Object.entries(campaign)) {
      if (!srcs.length) continue;
      lines.push(`  ${role}: [`);
      for (const src of srcs) lines.push(`    ${JSON.stringify(src)},`);
      lines.push("  ],");
    }
    lines.push("},");
    lines.push("");
  }

  const out = lines.join("\n");
  console.log(out);
  if (!dry) {
    await writeFile(path.join("scripts", "campaign-wiring.generated.txt"), out);
    console.log("→ scripts/campaign-wiring.generated.txt");
  }
}

main();
