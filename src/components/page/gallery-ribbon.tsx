"use client";

import DepthRibbon from "@/components/depth-ribbon";
import type { GalleryRoom } from "@/lib/pages";

/** Every room's plates on one ribbon, captioned with their house. */
export function GalleryRibbon({ rooms }: { rooms: readonly GalleryRoom[] }) {
  const items = rooms.flatMap((room) =>
    room.plates.map((p) => ({ src: p.src, alt: p.alt, title: room.eyebrow, subtitle: room.heading })),
  );
  return (
    <section className="bg-ink relative h-svh w-full">
      <DepthRibbon
        items={items}
        backgroundColor="#000000"
        radius={0}
        speed={1}
        ariaLabel="Aria Noir gallery"
        className="h-full w-full"
      />
    </section>
  );
}
