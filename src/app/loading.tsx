import { LoadingScreen } from "@/components/loading-screen";

/**
 * Every route's wait, unless a route declares its own.
 *
 * The heaviest pages on this site are the ones that bring a turntable and a
 * film with them, and before this existed a route change sat on the previous
 * page until the new one was ready to paint — which on a phone reads as a
 * dead tap rather than as a page coming.
 */
export default function Loading() {
  return <LoadingScreen />;
}
