# Deploying

This site ships through **Vercel**, from GitHub. **Never deploy it to
Netlify.**

That warning is here because this file used to say the opposite. It was
titled "Deploying to Netlify", walked through connecting a Netlify site, and
sat next to a `netlify.toml` and an `@netlify/plugin-nextjs` devDependency —
while every actual Production deployment on the repo was created by
`vercel[bot]`. Anyone reading the docs rather than the deployment history was
pointed at the wrong platform. The Netlify config and plugin are gone.

## How a deploy happens

`git push` is the deploy. There is no manual step.

```bash
git push origin rems-branch
```

Vercel builds every push and reports back as a commit status on GitHub.
Confirm it landed:

```bash
gh api repos/talkerstein-consulting/aria-noir-design/commits/HEAD/status --jq '.statuses[] | .context + " -> " + .state'
```

Do not run `vercel --prod` by hand. Promoting a validated preview is
cheaper and safer than rebuilding, and every extra build spends build
minutes for nothing.

## What this project costs to run

**It is fully static.** No API routes, no middleware, no cron jobs, no
`vercel.json`, nothing marked `force-dynamic`. All 26 routes are prerendered
— `○ Static` or `● SSG` in the build output. That means **zero serverless
functions**, which removes the largest and most unpredictable line on a
Vercel bill.

Keep it that way. Adding an API route, middleware, SSR, a cron job, Blob
storage, Analytics or Speed Insights changes this project's cost class, and
none of them should be added without a stated production reason.

The two costs that remain are **build minutes** and **bandwidth**:

| `public/` | size |
|---|---|
| images | 34 MB |
| models (glTF) | 32 MB |
| video | 8.6 MB |
| textures | 8.4 MB |
| HDRI | 7.8 MB |
| **total** | **92 MB** |

Nothing here is fetched all at once — the models are per-house and the films
are two — but it is the number to watch as traffic grows.

### Batch your pushes

Every push is a build. Build locally first and push when there is something
worth reviewing, rather than pushing each visual tweak:

```bash
npm run build
```

## Assets are committed, not uploaded

Static assets live in this repo under `public/`. They do not belong in
Vercel Blob — Blob is billed for storage, reads, writes and transfer, and is
for runtime uploads or generated files, which this site has none of.

Both source sets are gitignored, with a script that regenerates what ships:

| source (gitignored) | script | ships as |
|---|---|---|
| `video source/` | `node scripts/compress-video.mjs` | `public/video/*.mp4` |
| `scrape/` | `node scripts/import-colourway-photography.mjs` | `public/images/<house>/variants/` |
| `3d models/` | `node scripts/export-models.mjs` | `public/models/houses/*.glb` |

The films are already compressed — CRF 24, `preset slow`, **H.264 High
profile at level 4.0**, audio dropped (every film plays muted),
`+faststart` so playback begins before the download finishes.
`arca-i-hero.mp4` went from 42.1 MB @ 20.6 Mbps to **4.2 MB @ 2.0 Mbps**.

The level is not cosmetic: iOS Safari decodes High profile in hardware only
up to **level 4.2**, and above that it declines the video and shows its own
play button instead of a film. Left alone, x264 picks level 5.0 for 1080p.
Never remove `-level:v` from the encode.

The weight matters beyond bandwidth too: the home page's loader waits on
that film (`lib/preload`), and at 20 Mbps nothing could finish inside a
ceiling worth showing, so the loader gave up every time and handed over to a
hero that had not arrived.

## Worth doing, not yet done

**Image optimization is running at request time.** The pages use
`next/image`, so Vercel transforms images on demand and bills per
transform. For a site whose photography is fixed and already committed,
pre-sized assets would move that cost to build time. Not urgent at current
traffic; the first thing to look at if the Image Optimization line grows.

**Set Spend Management alerts** on the Vercel project, with low thresholds,
and check Usage after any launch day.

## Verifying a deploy

The scroll choreography runs on `requestAnimationFrame` and scroll
listeners, so a headless check will not exercise it. After deploying, open
the site and confirm:

- the loader counts 0→100 and hands over to a hero film that is already
  rolling — it waits on the film now, so it should never reveal a still one
- the video expands dot → mini → full bleed
- the logo docks into the navbar as you scroll
- the white iris opens over the gallery and the page stays light after it
- on a phone, the page scrolls freely over the turntable and the frame only
  turns when you drag the frame itself
- the footer ARIA mark draws itself in when it scrolls into view
