import { getImageProps } from "next/image";
import type { CSSProperties } from "react";

/**
 * One full-bleed plate with a portrait cut for phones, as a single <picture>.
 *
 * The heroes used to render two <Image fill priority> and let CSS hide one.
 * `priority` emits a preload link, and a preload ignores `hidden`, so every
 * device fetched BOTH plates at the highest priority — a phone paid for the
 * wide shot and a desktop for the upright one. A <picture> hands the choice
 * to the browser before any request: one file, the right one, still high
 * priority.
 *
 * Breaks at 640px, the `sm` edge the old `sm:hidden` pair used.
 */
export function ArtDirectedImage({
  src,
  portrait,
  alt,
  className = "",
  focus,
  focusPortrait,
  priority = false,
  style,
}: {
  src: string;
  portrait?: string | null;
  alt: string;
  className?: string;
  /** object-position for the wide plate, and for the portrait one. */
  focus?: string;
  focusPortrait?: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  const common = { alt, fill: true, sizes: "100vw", priority } as const;
  const wide = getImageProps({ ...common, src }).props;

  if (!portrait) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        {...wide}
        className={className}
        style={{ ...wide.style, ...style, objectPosition: focus }}
      />
    );
  }

  const tall = getImageProps({ ...common, src: portrait }).props;
  /* object-position differs per cut, and a <picture> cannot carry that per
     <source>, so both positions ride in as variables and the media query
     in the class picks one. Only when a caller names them: otherwise the
     caller's own className positions both cuts, as the old pair did. */
  const perCut = focus !== undefined || focusPortrait !== undefined;
  const vars = perCut
    ? ({
        "--focus-portrait": focusPortrait ?? "50% 40%",
        "--focus-wide": focus ?? "50% 30%",
      } as CSSProperties)
    : null;

  return (
    <picture>
      <source media="(min-width: 640px)" srcSet={wide.srcSet} sizes={wide.sizes} />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        {...tall}
        className={
          perCut
            ? `${className} object-[var(--focus-portrait)] sm:object-[var(--focus-wide)]`
            : className
        }
        style={{ ...tall.style, ...style, ...vars }}
      />
    </picture>
  );
}
