# Deploying to Netlify

## One-time setup

1. Push this branch to a Git remote Netlify can read.
2. In Netlify: **Add new site → Import an existing project**, pick the repo
   and branch.
3. Leave the build settings alone — `netlify.toml` already sets the command,
   the Node version, and the Next.js plugin. Netlify picks it up
   automatically, and the plugin resolves the publish directory itself.

No environment variables are required. Nothing in the app reads a secret.

## Or from the CLI

```bash
npx netlify-cli deploy --build --prod
```

## What is in the box

- `netlify.toml` — build command, Node 22, `@netlify/plugin-nextjs`, and
  cache headers.
- `@netlify/plugin-nextjs` is a devDependency, so the build resolves it
  without a plugin install step.

## Worth knowing before you ship

**The hero video is the whole payload.** `public/video/hero-bg.mp4` is
**31.5 MB** at ~16.8 Mbps — roughly 4× heavier than it needs to be, and it
is fetched on first paint. It is the single biggest thing you can fix:

```bash
ffmpeg -i public/video/hero-bg.mp4 -c:v libx264 -profile:v high -crf 24 \
  -preset slow -vf scale=1920:-2 -movflags +faststart -an \
  public/video/hero-bg-opt.mp4
```

That should land near 4–6 MB with no visible loss at this size (`-an` drops
the audio track, which is unused). Swap the filename in
`src/components/experience.tsx`.

Also in `public/`: two GLB models (~3.3 MB each). Only `ARCA.glb` is used
now — `AHAVA.glb` became unused when the closing 3D model was removed, so it
can be deleted unless you plan to bring it back.

**Git size.** The video is committed, so the repository carries it in history
(`.git` is ~36 MB). That is under GitHub's limits and will push fine, but if
this repo is going to live a long time, moving the video to Git LFS or to
external hosting is worth doing before the history grows further.

## Verifying a deploy

The scroll choreography is driven by `requestAnimationFrame` and scroll
listeners, so a headless check will not exercise it. After deploying, open
the site and confirm:

- the loader counts 0→100 and the video expands dot → mini → full bleed
- the logo docks into the navbar as you scroll
- the white iris opens over the gallery and the page stays light after it
- the footer ARIA mark draws itself in when it scrolls into view
