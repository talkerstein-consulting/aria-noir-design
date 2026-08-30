/**
 * Encode the film masters in `video source/` down to what a web page should
 * actually ship, into `public/video/`.
 *
 * ---- Why this exists ----
 *
 * `arca-i-hero.mp4` arrived as a 42MB, 20.6 Mbps master with an AAC track on
 * it. Every one of those three numbers is wrong for this page: the film is
 * decorative background behind a title, it is played `muted` and `loop`, and
 * it is the asset the home page's loader is supposed to WAIT for. At 20 Mbps
 * a visitor on anything short of a fast connection could not finish it inside
 * any loader worth showing, so the loader gave up on it and handed over to a
 * hero that had not arrived — which is the exact failure the loader exists to
 * prevent. Compression is not a nicety here; it is what makes the preloader
 * able to keep its promise.
 *
 * ---- The settings, and why ----
 *
 * CRF rather than a target bitrate: these are two very different clips and a
 * fixed bitrate would starve the busy one and waste bits on the calm one.
 * CRF asks for a QUALITY and spends whatever that costs.
 *
 * The audio is DROPPED, not re-encoded. Every one of these plays muted —
 * autoplay is only legal muted — so an audio track is bytes that can never
 * be heard.
 *
 * `+faststart` moves the index to the front of the file. Without it a browser
 * must fetch to the end before it can begin, which on a background video is
 * the difference between starting immediately and starting after the whole
 * download.
 *
 * `-pix_fmt yuv420p` because anything else fails to decode on Safari, and
 * these are exactly the files most likely to have come out of a grade in
 * something else.
 *
 *   node scripts/compress-video.mjs             # everything in video source/
 *   node scripts/compress-video.mjs hero-bg     # one file
 *
 * Requires ffmpeg on PATH. The masters stay in `video source/`, which is
 * gitignored for the same reason `3d models/` is: it is the original, and
 * what the site serves is derived from it reproducibly.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const SRC = "video source";
const OUT = path.join("public", "video");

/** Constant Rate Factor. 23 is ffmpeg's default and visually transparent for
 *  most material; 24 is one notch below it, which on a clip that sits behind
 *  a headline at 100% scale is not a difference anyone will find, and is
 *  worth roughly a fifth of the file. */
const CRF = 24;

/** How hard x264 looks for savings. `slow` costs encode time — once, here —
 *  and buys around 10% over `medium` at the same CRF. The visitor pays the
 *  download either way, so the trade is entirely one-sided. */
const PRESET = "slow";

/** Nothing here needs to be larger than a 1080p screen, and two of these are
 *  full-bleed background. Masters above this are downscaled; anything at or
 *  under it is left at its own size rather than being scaled up. */
const MAX_HEIGHT = 1080;

const only = process.argv[2];

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC)
  .filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f))
  .filter((f) => !only || path.parse(f).name === only);

if (!files.length) {
  console.error(`No masters in ${SRC}/${only ? ` matching "${only}"` : ""}`);
  process.exit(1);
}

for (const file of files) {
  const from = path.join(SRC, file);
  const to = path.join(OUT, `${path.parse(file).name}.mp4`);
  const before = statSync(from).size;

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i", from,
      "-an",
      "-c:v", "libx264",
      "-crf", String(CRF),
      "-preset", PRESET,
      "-profile:v", "high",
      "-pix_fmt", "yuv420p",
      /* Only ever down. `-2` keeps width even, which h264 requires. */
      "-vf", `scale=-2:'min(${MAX_HEIGHT},ih)'`,
      "-movflags", "+faststart",
      to,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  const after = statSync(to).size;
  const mb = (n) => (n / 1e6).toFixed(1);
  console.log(
    `${file}: ${mb(before)}MB → ${mb(after)}MB  (${Math.round((1 - after / before) * 100)}% smaller)`,
  );
}
