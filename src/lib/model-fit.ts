/**
 * How much room a GLB gets, everywhere on the site.
 *
 * ---- The rule ----
 *
 * A model never fills its stage. It is fitted inside a margin, and that
 * margin is the same fraction on every surface that lights one — the home
 * page's private-access film, the eyewear turntable, the buy page's
 * opening, the story pages' offering and palette. A frame that skims the
 * edge of its box reads as a photograph that was cropped too tight, and on
 * a stage that also carries type it reads as a collision: the object and
 * the heading are two things fighting for the same screen rather than one
 * composition.
 *
 * ---- Why a module and not a number in each file ----
 *
 * This WAS a number in each file, and the three of them had drifted:
 * 0.86 on the buy page and the story pages, 0.95 in private access, and a
 * camera margin of 1.12 on the eyewear index — three different amounts of
 * air on four surfaces showing the same six objects. Nobody chose that;
 * each was tuned alone against its own screen, which is how a house ends
 * up with one frame breathing and the next one pressed against the type
 * below it.
 *
 * So the air is decided once, here, and the stages ask.
 *
 * ---- The two ways a stage fits ----
 *
 * A stage either scales the OBJECT to the viewport (`fitScale`) or pushes
 * the CAMERA back from it (`fitDistance`). They are the same rule stated
 * from either end — a model occupying `MODEL_AIR` of the frame is a camera
 * standing `1 / MODEL_AIR` further back than the distance that would fill
 * it — which is why the reciprocal is exported rather than written out as
 * a second constant that could disagree with the first.
 */

/**
 * The fraction of the stage's SHORTER dimension a model may occupy.
 *
 * 0.86 rather than the 0.95 private access was using: at 0.95 the frame
 * ran to within a few pixels of both side edges on a phone, where the
 * shorter dimension is the width and there is no room to give. The
 * remaining 14% is not decoration — it is what stops the object from
 * touching the heading that shares the screen with it.
 *
 * Fitted against the bounding SPHERE at every call site, never the box: a
 * pair of glasses is narrowest face-on and widest at three-quarters, where
 * the temples swing out along Z, so a box fit is correct for exactly one
 * moment of a rotation the reader can still perform by hand.
 */
export const MODEL_AIR = 0.86;

/**
 * The fraction a story page's turntable may occupy instead.
 *
 * The story pages are the one surface where the object is the ARGUMENT
 * rather than a thumbnail of what is for sale: a full section, its own
 * concrete field, a heading and a CTA arranged around one frame the reader
 * is meant to turn. At 0.86 it read as a small object in a large empty
 * room — the air stopped being composure and became distance.
 *
 * Above 1 because the fit is against the bounding SPHERE, and the sphere
 * is sized by the frame's widest moment, three-quarters on, where the
 * temples swing out along Z. Face-on — which is where the frame rests and
 * where the reader sees it most of the time — the silhouette is much
 * narrower than that sphere, so 1.16 still leaves visible air at rest and
 * only approaches the edges at the angle that earns it. Measured at both
 * ends: at 1.34 the frame was cut off by the top of its box on a laptop,
 * and at 1.16 it clears the heading below it and the nav above it through
 * a full turn, at 375px and at desktop width.
 *
 * It is NOT the site-wide number. The home page's film, the eyewear
 * turntable and the buy page all share a screen with type in a way this
 * section does not, and `MODEL_AIR` is still what they ask for.
 */
export const MODEL_AIR_STORY = 1.16;

/**
 * The same rule for a stage that moves the camera instead of the model.
 * Multiply the distance at which the sphere exactly fills the frame by
 * this, and the object lands at `MODEL_AIR` of it.
 */
export const MODEL_MARGIN = 1 / MODEL_AIR;

/**
 * The scale that puts a sphere of `radius` inside `viewport` at the house
 * margin. `viewport` is r3f's, in world units at the focal plane.
 */
export function fitScale(
  viewport: { width: number; height: number },
  radius: number,
  /** The stage's own share, where it has earned one — see
   *  `MODEL_AIR_STORY`. Every caller that does not pass it gets the house
   *  number, which is the point of the module. */
  air: number = MODEL_AIR,
) {
  return (Math.min(viewport.width, viewport.height) * air) / (radius * 2);
}
