# Order — Aria Noir, 23 Nov 2026

Handoff from the previous session. Everything below is uncommitted work in
`C:\ACTIVE WORK\01 Aria Noir`, cloned from
`talkerstein-consulting/aria-noir-design` at commit `1d067163`.

**Nothing is committed. No production build has been run.** Read
"State on disk" before touching anything.

---

## State on disk

Modified, all verified in a browser at 375px and 1440px:

| File | What changed |
|---|---|
| `src/components/home/collection-tiles.tsx` | Square cells, plates uncropped, caption in flow |
| `src/components/home/home-social.tsx` | IG strip: heading, 4:5 cards, gutters |
| `src/components/home/home-gallery.tsx` | House letter: new mobile plate, raised type, two-row form |
| `src/components/house-notices.tsx` | Slim cookie bar |
| `src/components/site-nav.tsx` | Gallery/Maison swapped, right group reordered |
| `src/app/shop/page.tsx` | Dolly gallery removed, collection tiles back |
| `src/styles/house.css` | Supports the four above |

Untracked: `public/images/home/gallery/tablet-m.webp` — a newly rendered
plate, **not** a crop of anything in the repo. It must be committed with
the rest or the house letter breaks on phones.

Lint is clean on every touched file. Four `react-hooks/set-state-in-effect`
errors exist in `house-notices.tsx` and `collection-tiles.tsx`; they were
confirmed against `HEAD` and are **pre-existing**, not from this work.

Dev server: `npm run dev`. It came up on port 3001 here because 3000 was
taken. `.claude/launch.json` is the repo's own and was left untouched.

---

## 1. Finish Franky's gallery import

**Status: download in progress, nothing imported.**

The images are in the Talkerstein File Manager at **Aria Noir → Franky
Files**, uploaded by Franky on 11 Nov, with his "FINAL CLEANUP - ALL PRODUCT
GALLERY" entries running 11–16 Nov. Seven folders — `AHAVA`, `ARCA I`,
`ARCA II`, `MATRIARCA`, `MONARCA`, `PATRIARCA`, `SWEATER` — each holding a
`Rerun - <product>` subfolder of 5–8 MB PNG and JPEG masters. ARCA I alone
has 54.

A resumable puller is running: it walks the tree from folder
`5363a964-7e90-4ce9-9a44-c0448c687a8c` and mirrors it to the scratchpad,
skipping any file already on disk at the right size. At handoff: **176
files, 1.3 GB, through AHAVA, ARCA I and ARCA II.** Re-running it costs
nothing and resumes where it stopped. It reads the portal key from
`TCG_KEY`; that key lives in the local Claude config and must not be
written into the repo.

**What still has to happen:**

1. Let the pull finish, or re-run it — four folders are outstanding.
2. Inventory what arrived per house and pick the selects. These are raw
   masters; nothing is web-ready.
3. Convert to webp and wire through `scripts/import-rerun-photography.mjs`.
   **`scripts/rerun-manifest.json` only covers the Sep 18 "Fresh Batch"**
   and has keys for `ahava`, `alpaca-sweater`, `matriarca`, `monarca`,
   `patriarca` only. There is no `arca-i` or `arca-ii` key at all — those
   two need new manifest entries, not an edit to an existing one.
4. The ask was to plug them into **All Products** and the **Lookbook**.
   Confirm what "Lookbook" means in this repo before building it; the
   previous session did not establish that, and no page by that name
   exists.

---

## 2. PDP turntable — decided, not built

The turntable in `src/components/shop/spin-plate.tsx` is laggy. This was
measured, not guessed:

| | |
|---|---|
| Decode one 1200×900 AVIF frame | **10.68 ms**, main thread |
| Draw the same frame once decoded | **0.005 ms** |
| Per colourway | 360 frames, 15.5 KB each, 5.45 MB |
| Canvas | 1200×900 buffer in a 600×600 CSS box |

Three causes, compounding:

1. The component holds 360 `HTMLImageElement`s and calls
   `ctx.drawImage(img)`. 360 decoded 1200×900 bitmaps is **1.55 GB**, so the
   browser evicts and re-decodes constantly. `img.decoding = "async"` does
   not help — it only applies to the HTML render path, not `drawImage`.
2. `DEG_PER_SEC = 18` over `FRAMES = 360` is one new frame every 55 ms —
   **18 fps by design**. Going 180 → 360 halved the angular step but left
   the frame rate where it was, which is why it still is not smooth.
3. Dragging advances frames as fast as the pointer moves, each a fresh
   10.68 ms decode.

**Route chosen: an all-keyframe video.** Seeking was tested against the real
drag — 40 successive seeks three frames apart, then six long flicks:

| Encode | avg seek | worst | long flicks | size |
|---|---|---|---|---|
| Keyframe every 12 | 17.5 ms | 41.5 ms | 7.7–26.1 ms | 1.71 MB |
| **Every frame a keyframe** | **4.5 ms** | 13.4 ms | 3.2–7.5 ms | 3.69 MB |

All-intra is the only encode that survives a drag; `-g 12` averages above
the 16.7 ms frame budget. All-intra is still smaller than the AVIF set,
2.4× faster than the current decode, and runs on the GPU rather than the
main thread.

The fallback, if video is rejected: keep the stills but decode to
`ImageBitmap` and hold a rolling window of ~40–60 frames around the current
angle instead of all 360, and halve the source to ~800 px — the canvas is
600 CSS px, so 1200 is 4× what a 1× screen needs. Faster than video in the
common case (0.005 ms), but a fast flick outruns the window and falls back
to the full 10.68 ms, which is exactly the case being complained about.

**Watch out:** `arca-ii-noir` has no frame `345` on disk — the corrupt
upstream frame noted in `1d067163`. `nearest()` currently hides it by
showing 344 twice. Any build step over `public/images/spin` must handle
that gap deliberately.

`ffmpeg` is on PATH (8.1.2). `scripts/compress-video.mjs` is the precedent
for shelling out to it. Note that ffmpeg could not read the AVIF stills
through its `image2` pattern demuxer here — the frames had to go through
sharp to PNG first — and `libx264` rejects odd dimensions, so the scale
filter needs `trunc(iw/2)*2:trunc(ih/2)*2`.

---

## 3. Open question from earlier in the session

The Instagram strip was briefed on the 5 Nov call by Raviv relaying Jai as
"more vertical, displayed creatively, not a plain grid", styled after
Meshki Bridal's social strip — see `docs/feedback/FEEDBACK.md:179` and row
H5 at line 44. It shipped in `ae3da2bb` as **equal 1:1 squares**, which is
not what was asked, and nobody is recorded as having changed that decision.
It has now been moved to 4:5 portrait. Worth confirming with Raviv that
this is what he wanted rather than something more unusual.

The posts in that strip are still placeholders — the house's own worn
photographs. The real feed needs an Instagram Graph API token from the
account owner, and none has been provided.

---

## Conventions this repo holds you to

- Comments in these components carry the *reason* a thing is the way it is,
  usually with who asked and when. Keep that up; do not strip it.
- Check at 375px and desktop, and report which D-rules were checked or
  flagged — see the guardrails in `~/.claude/guardrails/`.
- Report honestly: a check that did not run is NOT RUN, not a pass.

---

## Session 2 findings — 23 Nov, continuing the gallery import

1. **The 1.3 GB pull is gone.** It lived in the previous session's
   scratchpad, which is wiped. 0 files remain. The pull restarts from zero,
   so it should mirror to a durable path outside the repo this time, not to
   a scratchpad.
2. **Portal access re-verified.** The tree under
   `5363a964-7e90-4ce9-9a44-c0448c687a8c` matches the handoff: seven houses,
   each with a `Rerun - <product>` subfolder. Several also carry
   `Editorial`, `references` and (SWEATER) `New Sweater` folders that the
   handoff does not mention and that are probably not part of the import.
3. **`/lookbook/ss26` does not exist.** `AGENTS.md` lists it among the ten
   in-scope routes, but there is no `src/app/lookbook` and nothing in
   `lib/navigation.ts` points at it. What exists is `ProductLookbook`
   (`src/components/product/product-lookbook.tsx`), a story-page layout
   variant used only by `/el-patron` — itself not one of the ten. So "the
   Lookbook" is still undefined: either a new `/lookbook/ss26` route, or the
   lookbook layout on `/arca-i` and `/arca-ii`. Needs Raviv.
4. **The importer does not fit this shoot.** `import-rerun-photography.mjs`
   expects numbered role folders (`01-face-fill`, `02-detail`, …) and maps
   houses through a `HOUSES` constant with no Arca I or Arca II. Franky's
   November folders are flat — files are named `Monarca - 11.jpeg` and
   similar, with no role structure at all. The manifest is keyed by role, so
   this is a new ingest path, not new manifest entries on the old one.

### Browser route — tested, blocked on a Chrome site permission

The File Manager UI was driven directly in the signed-in Chrome.

- **No bulk download exists.** A folder's action menu offers Open, Share,
  Rename, Move, Move to Trash — no Download, and no zip-a-folder. Only
  *files* have a Download item, one at a time.
- **Two different endpoints.** `/api/mcp/files/<id>?download=1` (what the
  MCP tool hands back) is Bearer-only: it returns 401 with session cookies.
  The web app's own `/api/library/files/<id>?download=1` *is* cookie
  authenticated, returns 206 to a Range request, and works.
- **Chrome blocks the bulk run.** One download triggered by hand succeeded:
  `Arca I - Rerun - 1.png`, 7,453,045 bytes, matching its Content-Range
  total. Driving the same control over 20 files triggered all 20 clicks
  with no errors and produced **zero** files; re-testing two files at 2.5 s
  spacing also produced zero. This is Chrome's automatic-downloads blocker
  — the first download after a real gesture is allowed, the rest need
  `app.talkerstein.ca` set to Automatic downloads → Allow. That is a
  browser security setting and is the owner's to change, not Claude's.

### Corrected inventory (counted from the live folder pages)

| House | Files in `Rerun -` |
|---|---|
| Ahava | 20 |
| Arca I | **74** (the handoff said 54) |
| Arca II | 49 |
| Matriarca | 13 |
| Monarca | **0** — its 7 images sit at the house root, not in the Rerun folder |
| Patriarca | 21 |
| Sweater | 29 |

**206 files** in the Rerun folders, plus Monarca's 7. At roughly 2–7.5 MB
each this is well above the 1.3 GB the handoff recorded.

### `Downloads/2nd Rerun` is not this shoot

`C:/Users/Rems 2021/Downloads/2nd Rerun` already exists and is
`import-rerun-photography.mjs`'s `DEFAULT_SRC`. It holds the **Sep 18 Fresh
Batch** — Ahava, Alpaca Sweater, Matriarca, Monarca, Patriarca, matching the
five manifest keys exactly, with no Arca. It is the already-imported shoot,
not Franky's November material.
