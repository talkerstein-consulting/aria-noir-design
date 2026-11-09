/**
 * Outlet logos, from the house's own press strip on its showcase
 * (arianoir-showcase.pages.dev/press/logos, Nov 2026). Each is a single-colour
 * mark, drawn here as a CSS mask so it takes the ground's type colour.
 * `aspect` is width over height, from each file's viewBox (Bloomberg's PNG:
 * its pixel size).
 */
export type PressLogo = { src: string; aspect: number };

export const PRESS_LOGOS: Readonly<Record<string, PressLogo>> = {
  designboom: { src: "/images/press/designboom.svg", aspect: 569.0 / 97.4 },
  "Yahoo Finance": { src: "/images/press/yahoo-finance.svg", aspect: 748.3 / 103.1 },
  "ACCESS Newswire": { src: "/images/press/access-newswire.svg", aspect: 444.5 / 173.8 },
  "Bloomberg Terminal": { src: "/images/press/bloomberg.png", aspect: 1433 / 266 },
  HNGN: { src: "/images/press/hngn.svg", aspect: 313.6 / 77.6 },
  "California Business Journal": { src: "/images/press/california-business-journal.svg", aspect: 1297.5 / 87.9 },
  "Cali Post": { src: "/images/press/cali-post.svg", aspect: 371.2 / 91.5 },
  "California Herald": { src: "/images/press/california-herald.svg", aspect: 712.9 / 91.5 },
  "EE Times": { src: "/images/press/ee-times.svg", aspect: 424.9 / 81.9 },
  "The American Reporter": { src: "/images/press/the-american-reporter.svg", aspect: 1447.4 / 81.5 },
  "New York Weekly": { src: "/images/press/new-york-weekly.svg", aspect: 1098.9 / 81.0 },
  "New York Feature": { src: "/images/press/new-york-feature.svg", aspect: 689.3 / 111.0 },
  "US Reporter": { src: "/images/press/us-reporter.svg", aspect: 794.3 / 76.8 },
};
