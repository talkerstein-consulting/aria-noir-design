# WebAR.rocks.face (vendored)

Face tracking for the live try-on at `/try-on`. MIT, see `LICENSE`.

Copied unmodified from https://github.com/WebAR-rocks/WebAR.rocks.face at
commit `819cdbad4e87a43635d5f9724e30f277a7e7964d`, from the ES-module build in
`reactThreeFiberDemos/src/js/contrib/WebARRocksFace/`:

| Here | Upstream |
|---|---|
| `WebARRocksFace.module.js` | `dist/WebARRocksFace.module.js` |
| `helpers/WebARRocksFaceThreeHelper.js` | `helpers/WebARRocksFaceThreeHelper.js` |
| `helpers/landmarksStabilizers/OneEuroLMStabilizer.js` | same path |
| `public/try-on/NN_GLASSES_9.json` | `neuralNets/NN_GLASSES_9.json` |
| `public/try-on/occluder.glb` | `src/assets/VTOGlasses/models3D/occluder.glb` |

The `.d.ts` files beside them are ours, and only type what
`components/try-on/engine.ts` calls.

Upstream's `WebARRocksMirror.js` is NOT vendored. It loads an HDR through
`RGBELoader`, which three r185 has replaced, and it assumes every arm
material is named `frame`. The few lines of it the try-on needs are ported
into `engine.ts` instead.

To update: copy the same files from a newer commit, bump the hash above.
