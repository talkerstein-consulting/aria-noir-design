/**
 * Single source of truth for the FIXED-OVERLAY choreography.
 *
 * Everything here is expressed in FRAMES, where 100 frames == 1 viewport
 * height. The scroll handler derives every progress value from these numbers,
 * and the on-screen HUD reads the same table — so a label can never drift from
 * what the page actually does. To re-time a beat, change it here only.
 *
 * The choreography finishes at `sceneShiftEnd`; everything after that is
 * ordinary document flow (see AtelierSection) and needs no frames at all.
 * The runway spacer is RUNWAY_VH tall, which is comfortably past that.
 */

export const FRAMES_PER_VH = 100;

/**
 * The phone's frame rate against scroll, and its runway.
 *
 * ---- Why the choreography is compressed rather than re-timed ----
 *
 * Every beat in `F` below is a frame number, and 100 frames is one viewport
 * height — so the table is not really a timeline, it is a SCROLL BUDGET. The
 * logo docks at frame 94, which means it docks after most of a screen of
 * scrolling, and the heading is not settled until frame 200, which is two.
 * On a desktop that is two turns of a wheel. On a phone it is two full
 * swipes before the page has said anything, and the reader is swiping past a
 * logo they have already read.
 *
 * Raising the frames-per-viewport is what shortens it, and it shortens the
 * whole thing PROPORTIONALLY: at 150, frame 94 lands at 0.63 of a screen and
 * frame 200 at 1.33, so the logo docks and the text settles inside what is
 * comfortably one swipe and a bit. Nothing about the composition changes —
 * the beats keep their relationship to each other exactly, which is the
 * point of expressing them as frames in the first place. Re-timing the table
 * for a second breakpoint would mean maintaining two sets of relationships
 * and getting to break one of them by accident.
 *
 * The runway shrinks with it, and has to: it is the scroll distance the
 * fixed scene needs, and the last beat is `modelEntryEnd` at 380. At 150
 * frames per screen that is 2.53 screens, against 3.8 on a desktop — which
 * is also what removes the third of a screen of dead black that used to sit
 * between the scene ending and the next section's heading. The runway
 * itself is `.home-runway` in the stylesheet; see the note above `F`.
 */
export const NARROW_FRAMES_PER_VH = 150;
/* The runway — the scroll distance the fixed scene plays over — is NOT here.
   It is `.home-runway` in styles/interactions.css, because it has to change
   on the same breakpoint the frame budget does and a stylesheet is the only
   place that can do that without re-rendering the page to follow a media
   query. Two copies of one number is how they drift; there is one, and this
   is the note that says where.

   It is sized to the last beat, `F.modelEntryEnd` at 380, plus a short
   landing. The 3D model and the ARCA I block that used to run to frame 620
   have both been removed from this page, which is why it is not sized to
   `sceneShiftEnd`. */

/** One vertical rhythm for every flow section, so the gaps between them read
 *  as a single system rather than per-section guesses. */
export const SECTION_PAD = "py-32 sm:py-48";

export const F = {
  heroStart: 0,
  logoDocked: 94, // logo finishes travelling into the navbar
  videoLiftStart: 94, // video BEGINS moving up here (shrink already underway)
  h2Start: 94,
  videoShrinkEnd: 200, // video reaches its resting size + height
  hangEnd: 320, // heading + body hang in the middle until here
  modelStart: 320, // model rises, video exits
  modelEntryEnd: 380,
  productStart: 400, // heading group out, ARCA I in
  h2FadeEnd: 460,
  productFull: 470,
  modelEnd: 560, // rotation completes 360°
  sceneShiftStart: 560, // whole scene scrolls up and off, like normal flow
  sceneShiftEnd: 620,

} as const;

/* ---- dark → light handoff ----
   Expressed as fractions of the GALLERY's own height, not absolute frames.
   The flow sections are content-sized, so their frame positions move with the
   viewport — at 375px the gallery starts at 1350, and a hard-coded 1321 would
   fire before it even began. These fractions put the dot at frames 1321→1421
   at the design viewport while staying anchored to the gallery everywhere. */
/**
 * Where the dark→light iris runs, measured in viewport heights back from the
 * BOTTOM of the section it is anchored to — not as a fraction of that
 * section's height, so a taller gallery doesn't start wiping itself earlier.
 * START is the point the gallery has effectively finished (its last row sits
 * fully on screen); END leaves the page white just as the section clears.
 */
export const DOT_START_VH = 1.05;
export const DOT_END_VH = 0.1;

export type Trigger = { frame: number; label: string };

export const TRIGGERS: Trigger[] = [
  { frame: F.heroStart, label: "hero · video full bleed" },
  { frame: F.logoDocked, label: "logo docked · video starts rising" },
  { frame: F.videoShrinkEnd, label: "video at rest · heading + body settled" },
  { frame: F.hangEnd, label: "hang ends · model rises · video exits" },
  { frame: F.modelEntryEnd, label: "model in · video gone" },
  { frame: F.productStart, label: "heading out · ARCA I rises" },
  { frame: F.productFull, label: "ARCA I full" },
  { frame: F.modelEnd, label: "rotation 360°" },
  { frame: F.sceneShiftStart, label: "scene scrolls up · atelier follows" },
  /* Informational: where the gallery-anchored dot lands at the design
     viewport. The behaviour derives from DOT_*_FRAC, not from these. */
  { frame: 1321, label: "white dot opens over the gallery" },
  { frame: 1421, label: "screen covered · light mode" },
];

/* ---------- transform constants ---------- */
export const EXIT_VH = 120; // video's total upward travel once fully exited
export const MODEL_Y_OFF = -3; // world units: below frustum at z=5, fov=40
export const PRODUCT_RISE_VH = 30; // ARCA I block rises from below the fold

/* Video's resting state at F.videoShrinkEnd. It parks in the UPPER half so
   there is real room beneath it. The heading group is anchored to the video's
   BOTTOM EDGE (derived, never hand-placed), so the two move as one unit and
   cannot drift apart — tune these three and the heading follows. */
export const VIDEO_REST_SCALE = 0.5;
export const VIDEO_REST_LIFT_VH = 26;
export const H2_GAP_VH = 7; // gap below the video's bottom edge
