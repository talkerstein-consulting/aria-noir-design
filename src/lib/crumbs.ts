import { architecture, houses, shopPath } from "./navigation";
import { COLLECTION_LABEL } from "./shop";

/**
 * The trail for a path.
 *
 * One resolver, read by the first eyebrow of every page (see
 * components/crumb-eyebrow), so no page carries its own trail and no two
 * pages can disagree about the shape of one. The frames are special-cased because they are the one
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

const HOME: Crumb = { label: "Home", href: "/" };
const EYEWEAR: Crumb = { label: COLLECTION_LABEL, href: "/eyewear" };

export function crumbsFor(pathname: string): Trail | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return null;

  for (const house of houses) {
    if (house.href && path === house.href) {
      return { trail: [HOME, EYEWEAR], current: house.name };
    }
    if (path === shopPath(house)) {
      return {
        trail: [
          HOME,
          EYEWEAR,
          ...(house.href ? [{ label: "The story", href: house.href }] : []),
        ],
        current: house.name,
      };
    }
  }

  /* Everything else is one step below the front door, so that is what the
     trail says: HOME · EYEWEAR.

     It used to name the MENU GROUP the route is filed under — "The frames"
     over Eyewear, "The transaction" over The Bag — and those are headings
     in the menu, not places: they have no page, so the crumb above you was
     one you could not go to. A trail whose parent is not a destination is
     a label wearing a breadcrumb's clothes. Home is a real parent, it is
     one click, and it is the honest shape of these URLs.

     (The trail used to leave Home out, on the argument that the logo
     directly above it already goes home. That was true while this was a
     strip pinned under the navbar; it is not the trail's neighbour any
     more — see components/crumb-eyebrow.) */
  for (const group of architecture) {
    const route = group.routes.find((r) => r.href === path);
    if (!route) continue;
    return { trail: [HOME], current: route.label };
  }

  return null;
}
