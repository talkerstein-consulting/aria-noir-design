# Live try-on

`/try-on` puts any house frame on the reader's face through their camera, in
real time. Face tracking is [WebAR.rocks.face](https://github.com/WebAR-rocks/WebAR.rocks.face)
(MIT), vendored in `src/vendor/webar-rocks-face`.

The frames are the second-generation models from the showcase
(`arianoir-showcase.pages.dev/models/gen2/`, plus `/models/ARCAI*.glb` for
ARCA I), one per colourway, 29 in all. The originals are 9-17MB Blender
exports; `scripts/build-try-on-models.mjs` compresses them into
`public/models/try-on` at 0.6-1.2MB each (Draco, WebP textures, no
simplification, names kept). `AHAVA-Black` is skipped: not a colourway the
store sells. The four ARCA I files are numbered, and are mapped by their
acetate colour: `ARCAI` K Black, `_2` Z White, `_3` Proceso Brown, `_4` 309
Blue. Any colourway without a try-on model falls back to its turntable model
in `public/models/houses`. The turntables themselves are unchanged.

## The pieces

| File | Job |
|---|---|
| `src/app/try-on/page.tsx` | The route. Reads `?house=&colour=` to open on a frame. |
| `src/components/try-on/try-on.tsx` | The UI: ask for the camera, the mirror, house and colour rail, capture. |
| `src/components/try-on/engine.ts` | Camera, tracking, three.js scene, render loop, capture. |
| `src/components/try-on/fit.ts` | Turns a house glb into something the tracker can wear. |
| `src/lib/try-on.ts` | Which frames are offered (every colourway with a model) and per-house fit corrections. |
| `public/try-on/NN_GLASSES_9.json` | WebAR.rocks's neural network for glasses (1.8MB). |
| `public/try-on/occluder.glb` | An invisible head, so the far arm hides behind it when you turn. |

## How a frame gets onto a face

1. **Nothing loads until the reader presses "Open the camera".** The engine,
   three.js and the network (about 2MB together) are imported on press, and
   the browser's camera prompt only shows then.
2. **WebAR.rocks opens the camera** and, every frame, runs the network on the
   video to find facial landmarks (eye corners, nose, ears). It draws the
   video into the first canvas.
3. **The head pose is solved** from seven of those landmarks against a mean
   face (`solvePnP`): ears, nose base and sides, outer eye corners. The chin
   is left out so the frame does not move when you talk. A One-Euro filter
   smooths the landmarks: steady when you hold still, quick when you move.
4. **One three.js object follows that pose.** The frame hangs inside it at a
   fixed offset, the bridge on the nose of the mean face. Three.js draws it
   into a second, transparent canvas laid over the video. Both canvases are
   flipped with CSS so it reads as a mirror.
5. **The occluder head** is drawn into the depth buffer only, so when you turn
   your head the far arm is hidden behind it, like a real one.
6. **The arms bend in a few degrees and fade out near the ears** (a vertex and
   fragment shader patch from upstream), so the tips never float in front of
   an ear the occluder missed.

## Fitting the house glbs (`fit.ts`)

WebAR.rocks expects frames authored to its own convention. The house glbs are
close already: real metres, Y up, front at Z = 0, arms running back along -Z.
On load, each frame is:

- **baked:** every node's transform is applied into the vertices, because the
  arm bend and fade read raw vertex positions. Mirrored nodes get their
  triangle winding flipped.
- **scaled true to size:** 1 face unit is about 1mm (the mean face is 154
  units across the ears, a real head about 145mm). A 150mm frame is drawn
  150mm wide. The houses are different widths and the mirror should show it.
- **placed:** centred on X, front of the frame at the tracker's Z, and the
  pupil line set 42% up the height of the front.
- **arms opened:** the models are unworn, arms parallel. Left that way the
  back of every arm sat inside the occluder head and vanished as the head
  turned. Behind the hinge, the arms are pushed out to an interior half-width
  of 1.04 frame units (`splayArms`), the width at which no house's arm is
  inside the head between hinge and ear. The front keeps its true size.
- **re-dressed:**
  - lenses (mesh or material named `lens`; PATRIARCA's lens mesh is called
    `Acetate_frame.004`) keep their authored tint but lose transmission:
    there is nothing behind them for the renderer to refract, so a
    transmissive lens would draw as a dark disc over the eye. Their opacity
    is `1 - transmission`, so the gen2 lenses (0.85) read nearly clear, as
    in the photographs.
  - transmissive acetate is made solid, for the same reason.
  - the baked ARCA II patterns carry a flat grey emission that washes the
    pattern out on a face. It is replaced by the pattern itself, at 40%.

## Tuning a house

Open `/try-on?fit=1` in development. It skips the camera and puts the frame on
the tracker's reference head in false colour, turning slowly. Every frame can
be judged against the same head. In the console, `window.__tryOn` is the
engine.

If a house sits wrong on real faces, add it to `FIT` in `src/lib/try-on.ts`:

```ts
const FIT = {
  matriarca: { y: -2 },      // 2mm lower
  monarca: { z: 1.5 },       // 1.5mm further from the face
};
```

The global constants (`PUPIL_FRACTION`, `FRONT_Z`, `FACE_UNITS_PER_MM`) are at
the top of `fit.ts`.

## Where it runs

- **HTTPS is required** for the camera, except on `localhost`. A Vercel
  preview or production URL is fine. Over plain http on a phone, the page says
  it needs a secure connection.
- Current Chrome, Safari (iOS 15+) and Edge, desktop and mobile. It needs
  WebGL. Older phones run it, at a lower frame rate.
- The video never leaves the device. Nothing is uploaded; capture makes a
  JPEG in the browser and saves it locally.

## Fine print and legal

The landing carries a short notice where the camera is asked for. It is a
reasonable baseline, **not legal advice**; have counsel review it for the
places the store sells into.

- **Face data.** The tracker maps facial geometry. Laws such as Illinois's
  BIPA, Texas's CUBI, Washington's biometric law and Quebec's Law 25 regulate
  that, and virtual try-ons have drawn BIPA class actions. The defence here is
  that nothing leaves the device: no image, video or landmark is stored or
  sent. The notice says so, and pressing "Open the camera" is the
  acknowledgement. If counsel wants explicit consent (a checkbox) before the
  camera opens, it goes beside the button in `try-on.tsx`.
- **Privacy policy.** `/policies/privacy` does not mention the camera yet. It
  should gain a paragraph saying the same thing as the notice.
- **Likeness, not a fitting.** The render is an approximation; colour, size
  and fit can differ. It is not a prescription or pupillary-distance fitting.
- **Captures** are made in the browser and saved only where the reader saves
  them.
- **Preview.** The animated preview uses campaign photography, not renders,
  and says so under it.
- **Licence.** WebAR.rocks is MIT; its notice ships in
  `src/vendor/webar-rocks-face/LICENSE` and is credited on the page.

## Status

- Built and checked in the fit-check mode: all six houses and their
  colourways load and sit on the reference head.
- **Not yet checked on a real face.** The dev preview had no camera. Before
  showing it to anyone, open `/try-on` on a laptop webcam and a phone, try
  each house, and add `FIT` entries where a house rides high or low.
- Not linked from anywhere yet. A "Try on" CTA on the buy page would link to
  `/try-on?house=<slug>&colour=<colourway>`.
- Static: no API routes, so it adds nothing to Vercel's function bill. The
  network file and glbs are cached static assets.
