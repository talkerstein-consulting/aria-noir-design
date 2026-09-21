/**
 * Single source of truth for the FIXED-OVERLAY choreography.
 *
 * Everything here is expressed in FRAMES, where 100 frames == 1 viewport
 * height. The scroll handler derives every progress value from these numbers,
 * and the on-screen HUD reads the same table — so a label can never drift from
 * what the page actually does. To re-time a beat, change it here only.
 *
 * The choreography finishes at `modelEntryEnd`; everything after that is
 * ordinary document flow (see AtelierSection) and needs no frames at all.
 * The runway spacer is sized to that last beat plus a short landing.
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
 * fixed scene needs, and the last beat is `modelEntryEnd` at 400. At 150
 * frames per screen that is 2.67 screens, against 4 on a desktop — which
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

   It is sized to the last beat, `F.modelEntryEnd` at 400, plus a short
   landing. The 3D model and the ARCA I block that used to run to frame 620
   have both been removed from this page, and so have their frame numbers:
   a table that runs to 620 when the scene ends at 400 reads as if there is
   half a page of choreography left that nothing plays.

   410vh against 400 frames is that landing, and 280vh against 2.67 screens
   on a phone. It was 420 against 380 and 270 against 2.53, which left four
   tenths of a screen of dead black between the scene ending and the next
   section's heading — a seam with nothing in it. A tenth of a screen is
   enough to land on; four tenths is a pause the page never asked for. */

/** One vertical rhythm for every flow section, so the gaps between them read
 *  as a single system rather than per-section guesses. */
/* `section-pad` carries no padding of its own — the two utilities beside
   it do that. It is a MARKER, so the stylesheet can recognise a section
   built this way as the same kind of thing as one built with the `.section`
   class, which sets the identical 5rem/12rem rhythm from `--section-pad`.
   Both exist, both are used, and without a shared hook the seam-collapsing
   rule in typography.css could only see half the sections on a page —
   which is why /arca-i still had doubled gaps after that rule landed. */
export const SECTION_PAD = "section-pad py-20 sm:py-48";

export const F = {
  heroStart: 0,
  logoDocked: 94, // logo finishes travelling into the navbar
  videoLiftStart: 94, // video BEGINS moving up here (shrink already underway)
  h2Start: 94,
  videoShrinkEnd: 200, // video reaches its resting size + height
  /* ---- why the hang is shorter than it was, and the exit longer ----

     These two beats used to be 200→320 and 320→380: one and a fifth
     screens of scrolling with NOTHING moving, and then the video's whole
     120vh exit spent in six tenths of a screen. Per screen of scroll the
     shrink moves about 25vh of content and that exit moved 200 — an
     eightfold change of gear, taken immediately after the longest still
     moment on the page. Scrolled at an even speed the section read as
     move, stop, snap.

     At 280 and 400 the hold is eight tenths of a screen and the exit gets
     one and a fifth, which puts the fastest and slowest beats within about
     three times each other — close enough that an even scroll feels even.
     The hang is still the longest pause here, and should be: it is the
     beat where the heading is meant to be read. */
  hangEnd: 280, // heading + body hang in the middle until here
  modelStart: 280, // video exits
  modelEntryEnd: 400,
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

/* ---- The frame map, for reading ----
 *
 * This was a `TRIGGERS` array, exported for a dev HUD (components/scroll-hud)
 * that nothing imported. The HUD is gone and so is the array: it drove no
 * behaviour — every one of these frames is read from `F` above, or from
 * DOT_*_FRAC — so it was a second copy of the timeline that could disagree
 * with the timeline.
 *
 * The labels were the useful part, so they stay here as prose. Nothing reads
 * them, which is the point: a comment cannot drift out of sync with the
 * constants beside it in the way a duplicate table can.
 *
 *   F.heroStart        hero · video full bleed
 *   F.logoDocked       logo docked · video starts rising
 *   F.videoShrinkEnd   video at rest · heading + body settled
 *   F.hangEnd          hang ends · video exits
 *   F.modelEntryEnd    video gone · scene ends
 *
 * And, at the design viewport only — these two follow the gallery via
 * DOT_START_VH / DOT_END_VH rather than any fixed frame:
 *
 *   ~1321             white dot opens over the gallery
 *   ~1421             screen covered · light mode
 */

/* ---------- transform constants ---------- */
export const EXIT_VH = 120; // video's total upward travel once fully exited

/* Video's resting state at F.videoShrinkEnd. It parks in the UPPER half so
   there is real room beneath it. The heading group is anchored to the video's
   BOTTOM EDGE (derived, never hand-placed), so the two move as one unit and
   cannot drift apart — tune these three and the heading follows. */
export const VIDEO_REST_SCALE = 0.5;
export const VIDEO_REST_LIFT_VH = 26;
export const H2_GAP_VH = 7; // gap below the video's bottom edge
