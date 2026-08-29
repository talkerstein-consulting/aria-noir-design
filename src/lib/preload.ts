/**
 * "Is the page actually ready?" — the question the home page's loader is
 * supposed to be asking.
 *
 * The opening counter used to be a 1.7-second animation with a number on it.
 * It always took 1.7 seconds: on a fast connection it was slower than the
 * page, and on a slow one it handed over to a hero video that had not
 * arrived, which is the failure that matters — the loader exists precisely
 * so nobody watches the first section assemble itself.
 *
 * This module is what it waits on instead. Three things, in parallel:
 *
 *   window `load` — every image, font and stylesheet the document declared.
 *      Note what this does NOT cover: media added by script after parse, and
 *      video that the browser is free to stop fetching once it has enough to
 *      start. Hence the other two.
 *
 *   every <video> in the DOM — held to `canplaythrough`, i.e. enough buffered
 *      to run start to finish at the current rate. `readyState` is checked
 *      first because a video that was already ready fires no event.
 *
 *   named files — anything fetched later by a component rather than declared
 *      in markup. The scroll-scrubbed clip is the case in point: it is pulled
 *      by FrameScrub deep down the page, so nothing above would ever wait for
 *      it. Fetching it here puts it in the HTTP cache before the reader can
 *      reach it.
 *
 * Everything is best-effort. A failed image, a video that stalls, a file that
 * 404s — none of them can be allowed to strand a visitor on a loading screen,
 * so every wait resolves rather than rejects, and each carries its own
 * timeout. The caller keeps a hard ceiling of its own on top of that.
 */

/** Longest any single asset may hold the loader. */
const PER_ASSET_MS = 8000;

/** Resolves with `false` if the promise has not settled in time. */
function withTimeout(p: Promise<unknown>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const t = window.setTimeout(resolve, ms);
    p.then(() => {
      window.clearTimeout(t);
      resolve();
    }).catch(() => {
      window.clearTimeout(t);
      resolve();
    });
  });
}

function documentLoaded(): Promise<void> {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function videoReady(el: HTMLVideoElement): Promise<void> {
  /* HAVE_FUTURE_DATA or better means it is already playable; such an element
     will never fire the event we would otherwise be waiting for. */
  if (el.readyState >= 3) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    el.addEventListener("canplaythrough", done, { once: true });
    /* A video that errors is not worth a loading screen — the page has a
       poster under every one of them. */
    el.addEventListener("error", done, { once: true });
  });
}

/**
 * Resolves once the page's declared assets and the named files are all in.
 *
 * `onProgress` is called with 0→1 as each unit completes, so the counter can
 * show real loading rather than a number counting itself.
 */
export function whenAssetsReady({
  files = [],
  onProgress,
}: {
  /** Fetched, not just declared — for media a component pulls in later. */
  files?: readonly string[];
  onProgress?: (fraction: number) => void;
} = {}): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const jobs: Promise<unknown>[] = [documentLoaded()];

  /* Videos are collected AFTER load so that anything React mounted during
     hydration is included, not just what the server sent. */
  jobs.push(
    documentLoaded().then(() =>
      Promise.all(
        Array.from(document.querySelectorAll("video")).map((v) =>
          withTimeout(videoReady(v), PER_ASSET_MS),
        ),
      ),
    ),
  );

  for (const file of files) {
    jobs.push(withTimeout(fetch(file, { cache: "force-cache" }), PER_ASSET_MS));
  }

  let done = 0;
  const total = jobs.length;
  const tracked = jobs.map((job) =>
    withTimeout(job, PER_ASSET_MS * 2).then(() => {
      done += 1;
      onProgress?.(done / total);
    }),
  );

  return Promise.all(tracked).then(() => undefined);
}
