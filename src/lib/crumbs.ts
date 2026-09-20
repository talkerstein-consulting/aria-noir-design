import { architecture, houses, shopPath } from "./navigation";
import { COLLECTION_LABEL } from "./shop";

/**
 * The trail for a path.
 *
 * One resolver, read by the strip under the navbar on every page, so no
 * page carries its own trail and no two pages can disagree about the
 * shape of one. The frames are special-cased because they are the one
 * three-deep path on the site — the index, the story, the counter — and
 * everything else is read off `architecture`, which already lists every
 * route under the group it belongs to.
 *
 * A crumb without an href is a heading, not a link: "The house" is a
 * group, and there is no page for it to go to.
 */
export type Crumb = { label: string; href?: string };

export type Trail = {
  /** Everything above the current page, nearest last. */
  trail: readonly Crumb[];
  /** The page itself. Never a link. */
  current: string;
};

const EYEWEAR: Crumb = { label: COLLECTION_LABEL, href: "/eyewear" };

export function crumbsFor(pathname: string): Trail | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return null;

  for (const house of houses) {
    if (house.href && path === house.href) {
      return { trail: [EYEWEAR], current: house.name };
    }
    if (path === shopPath(house)) {
      return {
        trail: [
          EYEWEAR,
          ...(house.href ? [{ label: "The story", href: house.href }] : []),
        ],
        current: house.name,
      };
    }
  }

  for (const group of architecture) {
    const route = group.routes.find((r) => r.href === path);
    if (!route) continue;
    /* The door has no group worth naming above it. */
    if (group.title === "The door") return { trail: [], current: route.label };
    /* A group whose name IS the page's name — "The house" over "The
       House" — is a stutter, not a trail. Drop the parent and let the
       page stand on its own. */
    if (group.title.toLowerCase() === route.label.toLowerCase()) {
      return { trail: [], current: route.label };
    }
    return { trail: [{ label: group.title }], current: route.label };
  }

  return null;
}
