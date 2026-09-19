import { PosterRig } from "@/components/product/poster-rig";

export const metadata = { robots: { index: false, follow: false } };

/**
 * The poster kitchen. `next dev`, then open `/poster`.
 *
 * It walks every glb in `public/models/houses`, renders each one through the
 * turntable's own rig, and posts the drawn frame to `/api/poster`, which
 * writes it into `public/images/posters`. See scripts/POSTERS.md.
 *
 * Why render them through the real component instead of a script: the
 * poster's only job is to be indistinguishable from the turntable's first
 * frame. A separate three.js scene in a node script would have its own
 * camera, its own tone mapping and its own idea of what an overcast sky is,
 * and every one of those would drift from the viewer the day either changed.
 * This cannot drift: it IS the viewer.
 */
/* The PAGE renders anywhere, so it is reachable from /sitemap like every
   other route. The WRITE does not: `/api/poster` still 404s outside
   `next dev`, because an endpoint that takes a filename and a blob and
   puts them on disk is not something to leave answering in production.
   Run outside dev, this page renders each frame and reports the refusal
   per model, which is the honest outcome rather than a hidden one. */
export default function PosterPage() {
  return <PosterRig />;
}
