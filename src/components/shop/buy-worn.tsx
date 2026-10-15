import Image from "next/image";
import type { House } from "@/lib/navigation";
import { WORN } from "@/lib/worn.generated";
import { RevealPlate } from "@/components/reveal";

/**
 * This frame, worn: the model photographs the showcase files under this
 * house, each captioned with the colourway in it.
 *
 * Per product only. The source is the showcase's Eyewear section, where
 * every photograph sits under one house and one colourway (see
 * `scripts/import-worn-photography.mjs`). A house with nothing filed there
 * renders nothing, and the page closes up around it.
 */
export function BuyWorn({ house }: { house: House }) {
  const plates = WORN[house.slug] ?? [];
  if (!plates.length) return null;

  return (
    <div className="mx-auto max-w-7xl">
      <p className="t-eyebrow">{`${house.name}, worn`}</p>

      <div className="mt-8 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {plates.map((plate, i) => (
          <figure key={plate.src}>
            <RevealPlate
              delay={i * 60}
              className="relative aspect-[4/5] w-full overflow-hidden bg-ink"
            >
              <Image
                src={plate.src}
                alt={`${house.name} in ${plate.colorway}, worn.`}
                fill
                sizes="(min-width: 1280px) 320px, (min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </RevealPlate>
            <figcaption className="t-caption mt-2">{plate.colorway}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
