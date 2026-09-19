# Posters — a still of every turntable

`public/images/posters/<glb-basename>.png`

One PNG per glb, rendered from that glb through the turntable's own rig, on
a transparent ground. They are the story page's placeholder while the
geometry arrives and its failsafe if the geometry never does — see
`src/components/product/model-still.tsx`.

## Making them

```bash
npm run dev
```

Then open **http://localhost:3000/poster** and leave the tab alone.

It walks the list in `src/components/product/poster-rig.tsx` one model at a
time, waits four frames after each scene is built (the environment map is
convolved on the render *after* the geometry lands — capture sooner and you
get a black object under no light), reads the canvas with `toDataURL`, and
POSTs it to `/api/poster`, which writes the file. Progress and the byte
count per file are printed on the page; a failure is printed in accent
against the model it belongs to.

The route and the endpoint both 404 unless `next dev` is what is running.

## Rules

- **Do not resize the window mid-run.** The stage is square and fixed at
  760px for a reason: the viewer fits the object to 86% of the *smaller*
  viewport dimension, so a poster made in a short wide window is framed
  differently from one made in a tall one, and the difference only becomes
  visible when two of them sit side by side.
- **The ground stays transparent.** The story page puts these on ink and
  the buy page puts them on a corridor photograph; a baked-in black would
  show as a square on the second one.
- **Commit them.** They are build output the way a photograph is:
  generated once from a source that rarely changes, far too slow to make at
  request time, and the site is visibly worse without them.
- **Re-run the whole set** after any change to the rig — the camera, the
  lightformers, the tone mapping, `PITCH`, `REST_YAW` — not just the models
  you touched. The poster's only job is to be indistinguishable from the
  turntable's first frame, and a set rendered under two different rigs
  fails at exactly that.

## Adding a model

Add its path to `MODELS` in `poster-rig.tsx` and re-run. The list is
hand-written rather than globbed because the browser cannot read a
directory, and a list that has to be edited when a model is added is a list
somebody actually reads.
