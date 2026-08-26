import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The shadcn class helper, added because the React Bits components expect
 * it at this path. Nothing hand-written on this site uses it — the house
 * vocabulary is `.cta` / `.link-quiet` / `.field` plus utilities, and none
 * of that needs conditional class merging. It exists so the registry
 * components resolve, and it should not spread past them.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
