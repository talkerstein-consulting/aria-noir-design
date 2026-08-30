/**
 * Make a background film actually play.
 *
 * ---- `autoplay` is a request, not an instruction ----
 *
 * Every film on this site is decorative: a hero behind a title, a loop
 * beside the detail tabs. All of them carry `autoPlay muted loop
 * playsInline`, which is the full set of conditions every browser documents
 * for silent autoplay — and it still does not always start.
 *
 * The ways it fails are all quiet ones:
 *
 *   - Low Power Mode on iOS refuses autoplay outright, muted or not.
 *   - Data Saver and some enterprise policies do the same on Android.
 *   - A tab opened in the background starts the element paused; nothing
 *     restarts it when the reader finally switches to it.
 *   - React hydration can attach a `src` after the element's own autoplay
 *     attempt has already come and gone.
 *
 * In every one of those the element sits on frame zero with no error
 * anywhere — the page just looks like it has a photograph where it promised
 * a film.
 *
 * So the film is asked directly, and asked again on the two occasions when
 * the answer can change: when the tab becomes visible, and on the reader's
 * first interaction of any kind. A muted video is exempt from the gesture
 * requirement almost everywhere, but where it is not, the first tap is the
 * moment the ban lifts — so that is where the retry belongs.
 *
 * Everything here is idempotent and self-cancelling: once an element is
 * playing, its listeners come off and it is never touched again.
 */

/** Elements already being nursed, so a ref callback that fires twice — or a
 *  StrictMode double-mount — does not stack two sets of listeners on one
 *  video. */
const watched = new WeakSet<HTMLVideoElement>();

/** The reader has done something. Any of these lifts an autoplay ban. */
const GESTURES = ["pointerdown", "touchstart", "keydown", "scroll"] as const;

/** Shortest gap between two recovery attempts on the same element.
 *
 *  The `pause` handler below asks a film that has just been paused to play
 *  again, which is a loop if the browser is refusing for a reason that will
 *  not change. Backing off means the worst case is one wasted call a second
 *  rather than a spin. */
const RETRY_MS = 1000;

/**
 * Ask this element to play, and keep asking on the occasions that matter.
 *
 * Safe to call on the same element repeatedly, and safe to call with null —
 * which is what a React ref callback hands you on unmount.
 */
export function kickPlay(el: HTMLVideoElement | null | undefined): void {
  if (!el || typeof window === "undefined") return;

  /* ---- Say it in the two places iOS reads ----
   *
   * Safari decides whether a video may autoplay inline from the ELEMENT's
   * own state, and it decides early. React writes `muted` as a DOM property
   * and `playsInline` as an attribute, and on a client-side navigation the
   * element is created and its `src` starts loading in the same tick those
   * are being applied — so the check can run against an element that is not
   * yet muted as far as the browser is concerned. The answer is then no,
   * and no is permanent for that load: Safari puts its own play button over
   * the film and waits for a tap.
   *
   * Setting both the property and the attribute is redundant on purpose.
   * `defaultMuted` is the one that reflects to the attribute, `muted` is the
   * one the current playback reads, and `webkit-playsinline` is what iOS
   * versions before 10 look for. None of it costs anything, and each covers
   * a case the others do not. */
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  el.setAttribute("muted", "");
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");

  let last = 0;

  const attempt = () => {
    if (!el.paused || el.ended) return;
    const now = performance.now();
    if (now - last < RETRY_MS) return;
    last = now;
    el.play().catch(() => {
      /* Refused. Not an error worth reporting: the poster underneath is a
         real photograph and the page reads correctly without the film. The
         listeners below are the retry. */
    });
  };

  attempt();

  if (watched.has(el)) return;
  watched.add(el);

  /* ---- What is NOT unsubscribed, and why ----

     The first version of this dropped every listener the moment the film
     reported `playing`, on the reasoning that a film that is rolling has no
     problem left to solve. That is wrong, and it is wrong in the exact case
     this exists for: browsers PAUSE a muted background video when its tab is
     hidden, and some pause it when it scrolls out of view. The film plays
     once on load, the reader switches tabs and comes back, and it is frozen
     on whatever frame it stopped at — with the retry already retired.

     So visibility and pause are watched for the life of the element. Only
     the gesture listeners come off, and only once something has actually
     played: a gesture matters solely for lifting an autoplay ban, and a ban
     that has been lifted does not come back. */
  const onVisible = () => {
    if (document.visibilityState === "visible") attempt();
  };
  const onGesture = () => attempt();
  const onPause = () => {
    /* Only chase a pause the reader cannot have asked for. These films have
       no controls, so while the page is in front of someone the only thing
       that pauses them is the browser. While it is hidden, being paused is
       correct — `onVisible` picks it up on the way back. */
    if (document.visibilityState === "visible") attempt();
  };

  document.addEventListener("visibilitychange", onVisible);
  el.addEventListener("pause", onPause);
  for (const g of GESTURES) {
    window.addEventListener(g, onGesture, { passive: true });
  }

  el.addEventListener(
    "playing",
    () => {
      for (const g of GESTURES) window.removeEventListener(g, onGesture);
    },
    { once: true },
  );
}
