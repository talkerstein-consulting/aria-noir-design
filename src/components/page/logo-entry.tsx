import { PRESS_LOGOS } from "@/lib/press-logos";

/**
 * One row of the Press and Heritage lists (Rems, 9 Nov: the outlets' own
 * logos in the left column, the same module on both pages). Left: the
 * outlet's logo, then the date. Right: whatever the page puts there.
 */
export function LogoEntry({
  outlet,
  when,
  children,
}: {
  /** The outlet, by the name PRESS_LOGOS keys it on. None: the date alone. */
  outlet?: string;
  when: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="hairline grid grid-cols-1 gap-3 py-8 sm:grid-cols-[11rem_1fr] sm:gap-10">
      <div className="flex flex-col gap-3">
        {outlet ? <OutletLogo outlet={outlet} /> : null}
        <p className="t-micro">{when}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </li>
  );
}

/** The outlet's mark in the type's colour, fitted into a 9.5rem by 1.6rem
 *  box so a long wordmark and a squat badge carry the same weight. Falls
 *  back to the name where there is no logo on file. */
export function OutletLogo({ outlet }: { outlet: string }) {
  const logo = PRESS_LOGOS[outlet];
  if (!logo) return <p className="t-label">{outlet}</p>;
  const maxW = 9.5; /* rem */
  const maxH = 1.6; /* rem */
  const w = Math.min(maxW, maxH * logo.aspect);
  const h = w / logo.aspect;
  return (
    <span
      role="img"
      aria-label={outlet}
      className="block bg-current"
      style={{
        width: `${w}rem`,
        height: `${h}rem`,
        WebkitMask: `url("${logo.src}") left center / contain no-repeat`,
        mask: `url("${logo.src}") left center / contain no-repeat`,
      }}
    />
  );
}
