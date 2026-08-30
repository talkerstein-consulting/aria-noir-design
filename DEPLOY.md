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

**The films are compressed, and there is a script for it.** This section
used to say the hero was 31.5 MB at ~16.8 Mbps and hand you an ffmpeg
command. That work is done:

| file | before | after |
|---|---|---|
| `public/video/arca-i-hero.mp4` | 42.1 MB @ 20.6 Mbps | **4.2 MB @ 2.0 Mbps** |
| `public/video/hero-bg.mp4` | 4.9 MB | **4.8 MB** |

The masters live in `video source/`, which is gitignored, and the encode is
`scripts/compress-video.mjs` — CRF 24, `preset slow`, audio dropped (every
film here plays muted), `+faststart` so playback can begin before the
download finishes. Add a new film by dropping the master in `video source/`
and running:

```bash
node scripts/compress-video.mjs
```

This matters beyond bandwidth: the home page's loader WAITS on the hero
film (`lib/preload`), and at 20 Mbps nothing could finish inside a ceiling
worth showing, so the loader gave up every time and handed over to a hero
that had not arrived.

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
