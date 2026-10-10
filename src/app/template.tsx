import { ViewTransition } from "react";

/**
 * Every page change crossfades: the old page fades out, the new one in
 * (house.css, `.page`). A template rather than the layout because it
 * mounts afresh on each navigation, which is what fires enter and exit.
 * Browsers without view transitions simply swap the page.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
