/**
 * The "turn me" mark under a turntable: a pair of glasses with an arrow
 * sweeping round them. Traced from the house's drawing; one stroke weight,
 * round ends, and `currentColor` so it takes the grey it is set in.
 */
export function RotateHint({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="175 225 674 590"
      fill="none"
      stroke="currentColor"
      strokeWidth={46}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Drag to rotate"
    >
      {/* Lenses and bridge */}
      <path d="M332 448C332 420 352 410 400 410C452 410 478 418 480 444C482 486 470 528 444 542C418 556 372 556 352 538C334 520 332 482 332 448Z" />
      <path d="M692 448C692 420 672 410 624 410C572 410 546 418 544 444C542 486 554 528 580 542C606 556 652 556 672 538C690 520 692 482 692 448Z" />
      <path d="M480 440Q512 418 544 440" />
      {/* Temples, folded up */}
      <path d="M318 432L390 290Q410 260 440 288" />
      <path d="M706 432L634 290Q614 260 584 288" />
      {/* The sweep round the frame, and its arrowhead */}
      <path d="M325 490C230 520 200 600 245 650C270 680 300 700 345 730" />
      <path d="M320 645L355 735L265 772" />
      <path d="M699 490C790 520 830 600 790 650C760 690 730 710 690 730" />
    </svg>
  );
}
