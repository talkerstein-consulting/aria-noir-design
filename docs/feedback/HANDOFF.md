# Aria Noir: handoff plan (9 Nov 2026)

Repo: `F:\ARCHIVE WORK\04 SEAN\295 Aria Noir - November 8` · `talkerstein-consulting/aria-noir-design` · branch `rems-branch`.
**Nothing is committed or deployed.** All work below is uncommitted on `rems-branch`, with 38 files modified and the rest new.

Key docs (all in `docs/feedback/`):
- `FEEDBACK.md`: every feedback item from Jai's review PDF, the 5 Nov call notes, Raviv's Slack follow-ups and the Fathom team call, with sources and status.
- `PRESS-CONTENT.md`: press list and notes.
- `2026-11-06 ARIA NOIR - Website Review.pdf`: Jai's deck.
- `review/Aria Noir Revisions.html`: the changed-items before/after page, self-contained. This is the same page as the artifact https://claude.ai/artifact/T5LFKFifBjnGBSb4Ebo6qK, which is private to the account that made it.
- `review/ARIA NOIR - Website revisions, before and after.pdf`: the older whole-page PDF, 192 pages.

---

## 1. In progress: finish these first

### 1a. Price type in the brand serif (code done, NOT verified)
- `src/styles/typography.css` has a new `.price, .buy-price, .buy-row-price, .story-pin__price` rule using `--font-display-stack`.
- `price` class added on: home fronts, Shop All cards, product cards, bag drawer (lines and subtotal), line card, bag-added, order summary, confirmation, checkout totals, account (desk) totals and lines.
- Prices inside running sentences ("2 pieces · $250", the desk breakdown line) were left in the text font on purpose.
- **To do:** load `/shop/arca-ii`, `/shop`, the bag and checkout, and confirm the prices render in the serif.
  - The dev server crashed on a Next font-loader cache error (`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`). I cleared `.next/dev` and restarted it on :3000; whether it recovered was not confirmed.
  - If it still fails: stop it, delete `.next`, then `npm run dev`.

### 1b. Sizing diagram on the buy page (NOT started in code)
Rems asked for a dimensioned drawing like the "SUTRO" example: the frame's flat front view with dimension arrows.
- Bridge width on top.
- Lens height on the left.
- Eye width inside the right lens.
- Overall front width underneath.
- A line under it: "Overall width: X mm · Sizing: eye - bridge - temple".

**Use the real frame from its 3D model, not a drawing:**
1. Serve the repo locally: `python -m http.server 3200 --bind 127.0.0.1`, run from the repo root.
2. In headless Chrome (puppeteer-core with the installed Chrome), load each house's hero `.glb` with three.js.
   - Use `node_modules/three/build/three.module.js` and `node_modules/three/examples/jsm/loaders/{GLTFLoader,DRACOLoader}.js`, with an import map for `three`. The Draco decoder is in `public/draco/`.
   - Models are listed in `src/lib/navigation.ts` as `model:` for each house, e.g. `public/models/houses/patriarca-midnight-noir.glb`, `arca-ii-noir-baked.glb`, `ahava-noir.glb`, `monarca-noir.glb`, `matriarca-midnight-noir.glb`, `arca-i-k-black.glb`.
3. Use an **orthographic camera**, straight on, transparent background. Render both ends of the depth axis once to find which end is the front, then save `public/images/fit/<house>.png` (or webp), trimmed to the frame.
4. **Measurements:** use `FRAME_FIT` in `src/lib/product.ts`. These are Jai's numbers from his showcase `/fit/` table, measured from the 3D files: eye, bridge, lensHeight, front, temple.
5. **Arrow placement:** scale = image front width in px ÷ `front` mm.
   - Bridge: centre ± bridge/2.
   - Right lens: centre + bridge/2 → + eye.
   - Lens height: centred vertically on the lens.
   - Front width: the full trimmed width.
6. **Build:**
   - Replace `FaceDiagram` in `src/components/shop/size-guide.tsx`, or add a `FrameDiagram` beside it, as an SVG overlay on the image.
   - Pass the house's fit data through the Fit tab in `src/app/shop/[slug]/page.tsx` (`fitTab()`); `DetailTab.guide` is defined in `src/components/shop/buy-detail.tsx`.
   - Keep the three measurement explanations (face width, PD, lens depth); Rems chose "guide + diagram".
7. Check at 1440 and 390 that there's no sideways scroll.

### 1c. Then update the artifact (Rems: "update the artifact once done")
- Re-capture the `price` and `fit` items, plus anything else changed since: `docs/feedback/review/tools/items-capture.mjs` with `artifact-items.json`.
  - before = `https://aria-noir-design-staging.vercel.app`, after = a production build: `npx next build` then `npx next start -p 3100`.
  - Usage: `node items-capture.mjs <spec.json> <outDir> <baseUrl> before|after`; `ONLY=price,fit` limits it to those items.
  - Install `puppeteer-core@23.11.1` in a scratch folder; Chrome is at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- Rebuild `review/Aria Noir Revisions.html`.
  - The generator was an inline script, so to rebuild: for each item, quote + source + change + before/after `<img>` as base64 data URIs (publishing separate image files was blocked by a permission rule).
  - Layout: grouped by page, the quote in a gold-ruled block, before | after side by side, stacked on phones.
- Republish. The artifact belongs to the first account; from another account, publish it as a new artifact.

---

## 2. Done this pass (all uncommitted)

**Homepage**
- Hero is a muted 25s montage of the six frames' clips: `public/video/home/hero-1080.mp4` and `hero-m.mp4`.
- The carousel was built, then removed on Rems's call.
- Six-tile grid: **black** gutters on the homepage, **white** elsewhere (`gutter` prop on `CollectionTiles`).
- Section spacing added.
- The house letter section sits on one still photo instead of the WebGL spiral.
- The gift pop-up has no flame, a plain appear (`BURN_IN = false` in `house-notices.tsx`).

**Footer**
- Giant wordmark replaced by the small house emblem above the legal links.
- About group: About, Heritage, Craftsmanship, Press, Careers, Contact.

**Header and naming**
- Search, Account and Bag as words.
- Menu reads "The Collection" and "Maison" (Rems, 9 Nov: Maison, not About). The footer group and page eyebrows say Maison; the first tab and the footer link to the About page stay "About".
- Opening search no longer changes the bar's size; the fix is utility classes on `.nav-search` in `nav-search.tsx`, because the dev CSS cache ignored the stylesheet edit.
- The motto "By designers, for designers." is restored.

**Maison section**
- Tabs on the opened pages: About · Heritage · Craftsmanship, sized like the nav words. The Book tab was removed.
- **Heritage** is built from Jai's published material (`src/lib/heritage.ts`):
  - a Kyiv-shoot cover,
  - his About lines,
  - three photos from Book I/II,
  - press milestones with outlet logos.
- **Craftsmanship** has a cover still from the factory film, plus the film and the making copy.
- **Press** (`/house/press`): a dated list with outlet logos (shared `LogoEntry` module, also used on Heritage).
- **Careers** and **Registration**: new pages.

**Buy pages**
- Try-on unlinked (`TRY_ON_ON_PAGES = false` in `src/lib/try-on.ts`).
- Fit row: sizing guide (face diagram placeholder), Jai's measurements, Frame PD.
- Craft and packaging section (`buy-craft.tsx`).
- Rerun photography wired into the four campaign houses.

**Turntables**
- All 30 colourways use Jai's new renders, 180 frames at 1600px in `public/images/spin/` (`scripts/import-showcase-turntables.mjs`).
- No play button; turns while in view; stops when grabbed.
- PATRIARCA ×1.25 on desktop, ARCA I ×1.15 on mobile.
- Landscape fixed.
- Reveal race fixed in `spin-plate.tsx`.

**ARCA I:** the two old 3D renders removed from the lookbook.

**Shop All:** the filter/sort strip is black.

**El Patrón:**
- All five yarns offered (`listed: true`).
- A dedicated page at `/el-patron`.

**Removed:** the care guide: `/care` and every link to it.

**Assets**
- The 2nd Rerun shoot is in `public/images/*/rerun/` (`scripts/import-rerun-photography.mjs`).
- Jai's showcase turntables are mirrored in `scrape/showcase/`, which is gitignored (`scripts/scrape_showcase.py`).

**Verified on 9 Nov, before 1a:** the production build passed, including the type-check. Lint was clean on the touched files; the remaining errors already existed. Pages were checked at 1440/390.

## 3. Open decisions (need Rems or Jai)
- **El Patrón price:** $100 on the site, $180 USD on Jai's showcase.
- **Press email:** press@arianoir.com or admin@arianoir.com.
- **Studio city:** the menu says Los Angeles; Jai and the press say Toronto (company address Markham, ON).
- **Craftsmanship copy:** needs Jai's sign-off on the facts (his checklist: "once facts are confirmed").
- **Not built (Jai's "Next" list):**
  - Eternal 8 pre-order and certificate
  - Instagram feed (Meshki style)
  - Journal
  - New frame films (Franky)
  - Three-head-size fit images
  - Re-cropping the ARCA I film scene for mobile

## 4. Housekeeping
- Time logged on Talkerstein, task "Aria Noir: Website Development": 108 min (8 Nov), then 109 min and 31 min (9 Nov, up to 21:10 Asia/Shanghai). Anything after 21:10 on 9 Nov is not logged.
- `.gitignore` excludes `docs/feedback/review/before/` and `after/` (screenshots). The PDF and HTML in `docs/feedback/review/` are tracked.
- `"Slack connection - Claude Code.pdf"` is an untracked file at the repo root, not part of the site. Delete it or leave it out of the commit.
- Before committing: review the diff, then commit to `rems-branch` only. Nothing has been pushed.
