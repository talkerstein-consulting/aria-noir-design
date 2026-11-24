import { ViewTransition } from "react";

/**
 * Every page change crossfades: the old page fades out, the new one in
 * (house.css, `.page`). A template rather than the layout because it
 * mounts afresh on each navigation, which is what fires enter and exit.
 * Browsers without view transitions simply swap the page.
 *
 * ---- One navigation is not a crossfade ----
 *
 * The foot of a story page IS the top of its buy page: there is nothing
 * under the faces, and scrolling there pushes the route (StoryHandoff).
 * A crossfade would say those are two pages that happen to follow each
 * other. They are one move forward, so that push carries the `story-wipe`
 * transition type and gets `.story-wipe` instead — the story held dead
 * still where the reader left it while the buy page opens through it from
 * a point at the centre of the screen. See house.css.
 *
 * Keyed by type rather than by route because the type is set where the
 * intent is: a press on the pinned ACQUIRE link goes to the same URL and
 * should still crossfade, since that is a jump, not a walk.
 *
 * ---- Why the grain hangs here and not on <body> ----
 *
 * `.page-shell` is the host for the global film grain (globals.css). It
 * used to be `body::after`, which is correct for a page that only ever
 * sits still and wrong for one that is snapshotted.
 *
 * A view transition replaces the live document with flat snapshots. The
 * grain, fixed and hanging off <body>, was OUTSIDE this <ViewTransition>,
 * so it was captured into the `root` group — while the incoming page is
 * captured into `.story-wipe`, which held the content and no grain. The
 * circle therefore opened onto an ungrained buy page and the grain
 * snapped back on when the transition ended: at the foot of a story, the
 * grain visibly dropped out for the length of the wipe.
 *
 * Hung here it is inside the transitioned subtree, so both snapshots
 * carry their own grain and the circle reveals a grained page. It is
 * still `position: fixed`, still one layer, still viewport-locked — this
 * div has no transform of its own, and the transforms a view transition
 * applies land on the ::view-transition-group pseudo-element rather than
 * on the element, so the containing block is unchanged.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "story-wipe": "story-wipe", default: "page" }}
      exit={{ "story-wipe": "story-wipe", default: "page" }}
      default="none"
    >
      <div className="page-shell">{children}</div>
    </ViewTransition>
  );
}
