import { LoadingScreen } from "@/components/loading-screen";

/** The product page opens on white, so its wait is white too. */
export default function Loading() {
  return <LoadingScreen tone="light" />;
}
