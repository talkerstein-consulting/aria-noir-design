# QA checklist

Page-by-page pass over the eight in-scope routes (see AGENTS.md) for
WCAG, load time and responsiveness. Each page is checked at desktop and
at 375px, with the dev server (`npm run dev`, or the `aria-noir-verify`
launch config) and the in-app browser.

What is checked on every page:

- one `<h1>`, sensible H2/H3 outline, `<main id="main">` reachable from
  the skip link, landmarks named
- every image has `alt`; decorative ones empty; no unnamed links/buttons;
  every input labelled
- any autoplaying film: poster, `prefers-reduced-motion` honoured, a
  pause control (WCAG 2.2.2)
- keyboard: tab order, visible focus ring
- no horizontal overflow at 375px; touch targets not under 24px unless
  spaced; smallest type noted
- console clean of errors; no 4xx resources; transfer size and the
  biggest assets noted

## Status

| Route | Status | Notes |
|---|---|---|
| `/` Home | DONE | see below |
| `/arca-i` | DONE | film pause control added |
| `/arca-ii` | DONE | restored 6 deleted plates; colourway names on phones |
| `/shop/[slug]` (checked `arca-i`) | DONE | breadcrumb, buy-section spacing, till pinned on phones |
| `/lookbook/ss26` | TODO | |
| `/house/about` | TODO | uses the restored `plate-12/13/17` images: confirm they render |
| `/contact` | TODO | hero uses restored `plate-13-studio-shadow.webp` |
| `/bag` | TODO | also walk `/checkout` since the bag leads there |

Other shop slugs (`arca-ii`, `ahava`, `matriarca`, `patriarca`,
`monarca`) share the buy page component; spot-check one with 8
colourways (`arca-ii`) on a phone.

## Done so far (uncommitted, on `rems-branch`)

Home
- `sr-only` H1 in `experience.tsx`; skip link in `layout.tsx`; every
  `<main>` carries `id="main" tabIndex={-1}`
- hero film: poster (`public/video/hero-bg-poster.webp`), reduced-motion
  hold, lucide Pause/Play control; `lib/autoplay.ts` respects `data-held`
- "Word from the bench" submit is a lucide `ChevronRight`
- six-houses plates: new `split` label placement (name top, CTA foot),
  portrait covers on phones (`plateNarrow`), AHAVA cropped in
  (`plateNarrowZoom`), plate box clipped so the crop cannot spill
- footer on phones: legal links, ARIA mark, then the Talkerstein plaque
  full width as the last line; "Follow us" is a sitemap tab

ARCA I / ARCA II
- `product/hero-film.tsx`: reduced-motion hold + pause control on both
  films per page
- `product-palette.tsx`: colourway names run as one line under `sm`
  (8 bands overflowed the screen)
- restored `public/images/plate-00/05/12/13/16/17-*.webp` from
  `20b4735^` (deleted by that commit, still referenced by `lib/pages.ts`)

Buy page
- breadcrumb on phones: current crumb first, trail swipeable under a
  right fade (`.crumb-eyebrow`, flex `order`)
- `.buy-section` top padding 5rem / 7rem (was 8rem / 12rem), sticky offer
  reads the same `--buy-top`
- desktop opening shortened: `OPENING` 0.85 -> 0.4, `.buy-opening` 78vh
  -> 40vh, so Add to bag is inside the fold after a third of a screen
- phones: the buy row is pinned to the foot from first load

## Flagged, not changed

- The three films are 3.7 to 4.7 MB each with `preload="auto"`; the
  home loader is designed to wait on them. The real fix is a smaller
  encode (`scripts/compress-video.mjs`, needs ffmpeg, not installed here).
- 10 to 11px smallest type (swatch names, footer links) and footer links
  ~15px tall. Typographic call, left alone.
- `sizes="100vw"` warning on the collection plates is correct as-is:
  they scale to full bleed.
- `THREE.Clock` deprecation warning from the turntable.
- Next dev tools "N" button overlaps the pinned buy row bottom-left on
  phones. Dev only.

## Gotchas for whoever resumes

- Another Claude session was editing this working tree at the same time
  during this pass: `tcg-badge.css`, `navigation.ts`, `site-footer.tsx`
  were rewritten under me and edits had to be re-applied. Check
  `git status` for a second set of changes before committing, and close
  any other session on this folder first.
- The in-app browser's viewport emulation drifts (reports one width,
  renders another). Verify phone layouts by DOM measurement
  (`getBoundingClientRect`) as well as screenshots.
- The site uses Lenis; `window.__lenis.scrollTo(y, { immediate: true })`
  is the reliable way to move the page from a script. `scrollTo` alone
  is ignored, and the page restores scroll position on reload
  (`history.scrollRestoration = "manual"` first).
- COPY.md: no em-dashes in customer-facing copy; never explain the
  tagline.
