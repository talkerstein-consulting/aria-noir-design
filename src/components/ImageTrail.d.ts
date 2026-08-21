import type { ReactElement } from "react";

/**
 * Types for the vendored ReactBits ImageTrail (ImageTrail.jsx).
 * Its `items = []` default infers as never[], so the props are declared here
 * rather than editing the third-party source.
 */
declare function ImageTrail(props: {
  /** Image URLs, in trail order. */
  items?: string[];
  /** 1–8; picks one of the bundled trail behaviours. */
  variant?: number;
}): ReactElement;

export default ImageTrail;
