import { redirect } from "next/navigation";

/**
 * The bag is at `/bag`.
 *
 * Kept as a redirect rather than deleted: `/cart` is the URL every shopper
 * on the internet guesses, it was live on this site, and a 404 at that
 * address is the shop appearing to have lost the thing they were holding.
 *
 * It pointed at `/room` while the bag was a section of that page. The bag
 * has its own address now, so this points at the bag itself rather than at
 * the page the bag used to be inside.
 */
export default function CartPage() {
  redirect("/bag");
}
