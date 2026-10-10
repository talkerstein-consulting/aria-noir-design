/**
 * The wait, for a whole route: black, and nothing else.
 *
 * No logo here on purpose. The logo belongs to the morph: the first-visit
 * loader (layout.tsx, BOOT_LIFT) and the route cover (route-wipe.tsx) each
 * show the one logo and fly it into the navbar. A second, static logo here
 * sat underneath the moving one whenever a route was slow, which put three
 * on screen at once (this one, the moving one, the nav's). One logo, always.
 *
 * Needs no JavaScript: this is what Next renders while the real route is
 * still arriving.
 */
export function LoadingScreen({
  label = "Loading",
  tone,
}: {
  label?: string;
  /** "light" for a route that opens on white (the product page). */
  tone?: "light";
}) {
  return (
    <div className="site-loading" data-tone={tone} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
    </div>
  );
}
