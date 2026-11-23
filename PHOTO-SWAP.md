# Photo swap: Franky Files, Nov 2026

Source: Talkerstein file manager, Team files / Aria Noir / Franky Files
(MATRIARCA, MONARCA, PATRIARCA, SWEATER). 133 frames downloaded, encoded at
2400px long edge, webp q82, matching `scripts/import-rerun-photography.mjs`.

## Live in the build

Ten Patriarca frames are reruns of named campaign plates the catalogue
already points at, so they were written onto those paths and need no
catalogue edit. Visible on `/house/about`, `/shop/patriarca` and
`/patriarca`.

| New frame | Plate it replaced |
|---|---|
| amphitheater-facade | `campaign/wide-amphitheater-facade.webp` |
| aria-creative-02-archway | `campaign/creative-aria-creative-02-archway.webp` |
| noir-creative-02-archway | `campaign/creative-noir-creative-02-archway.webp` |
| duo-creative-02-doorway-silhouette | `campaign/creative-duo-creative-02-doorway-silhouette.webp` |
| macro-03-mosaic | `campaign/macro-macro-03-mosaic.webp` |
| macro-04-temple-woodgrain | `campaign/macro-macro-04-temple-woodgrain.webp` |
| vibe-01-lattice-shadows | `campaign/vibe-vibe-01-lattice-shadows.webp` |
| vibe-02-statue-fragment | `campaign/vibe-vibe-02-statue-fragment.webp` |
| vibe-03-worn-steps | `campaign/vibe-vibe-03-worn-steps.webp` |
| vibe-04-corridor-light | `campaign/vibe-vibe-04-corridor-light.webp` |

Every ratio is unchanged against the old plate, so `PLATE_SIZES` stays
correct and `plateRatio` layout is unaffected. Only the pixel count rose,
from 1920 to 2400 on the long edge.

`creative-noir-creative-02-archway` is the one of the ten the catalogue does
not currently show; its Aria half is on `/patriarca`.

## Duplicates removed

19 frames came back byte-identical to plates already in the build, so the
copies were deleted rather than left beside the originals: the 8 SWEATER
colourway frames (already in `alpaca-sweater/rerun/variation/`) and 11 of the
13 MATRIARCA rerun frames (already in `matriarca/rerun/`).

## On disk, not wired (64 frames)

No slot exists for these. They are a studio editorial, which is a different
register from the location photography every designed route is built on, so
nothing was repointed at them.

- `public/images/monarca/editorial/` (40): Aria and Noir on seamless and
  black backdrops. `monarca/campaign/` is entirely Venetian location work.
- `public/images/monarca/loose/` (7): from the MONARCA folder root.
- `public/images/patriarca/editorial/` (9): studio portraits, a white bust,
  mirrors, a lace veil, a couture gown.
- `public/images/matriarca/editorial/` (4): two studio, two in Egypt.
- `public/images/matriarca/rerun/` (2): the frame on sand before a
  hieroglyph wall, and Noir before the pyramids.
- `public/images/patriarca/rerun/` (2): `pylon-doorway-aria` and
  `worms-eye-colossus-noir`. Both are Egyptian, so they are MATRIARCA
  frames sitting in the PATRIARCA folder. They were filed by source folder
  as instructed; moving them to `matriarca/` is a one-line change.

The obvious home for the editorial sets is `/lookbook/ss26`, which
`AGENTS.md` lists in scope but which has no route: `src/app/lookbook` does
not exist and `lib/pages.ts` records that its page data was removed.

## Notes

- `scripts/measure-plates.mjs` is stale. It reads only `.jpg`/`.jpeg`/`.png`
  and the library is now `.webp`, so running it as its own header instructs
  rewrites `src/lib/plate-sizes.ts` down to a single entry. It was run and
  reverted during this work; the registry is untouched.
- `/house/about` logs a pre-existing React duplicate-key warning for
  `patriarca-midnight-noir`, from the colourway model list, not from
  photography.
