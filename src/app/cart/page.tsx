import { redirect } from "next/navigation";

/**
 * The bag moved into the Room.
 *
 * Kept as a redirect rather than deleted: `/cart` is the URL every shopper
 * on the internet guesses, it was live on this site, and a 404 at that
 * address is the shop appearing to have lost the thing they were holding.
 */
export default function CartPage() {
  redirect("/room");
}
