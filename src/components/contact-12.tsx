"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { CtaLink } from "@/components/cta-link";
import { contact } from "@/lib/pages";

/**
 * `@reactbits-pro/contact-12`, rebranded.
 *
 * What was kept is the block's SHAPE and its motion: a headline with a
 * single hard number set against it, then a staggered grid of routes, each
 * one a title, a sentence and an action, rising 20px into place seven
 * hundredths of a second apart.
 *
 * What was thrown away is everything the registry drew it with. The stock
 * block is a SaaS contact page — lucide icons in rounded tiles, `rounded-2xl`
 * cards on `bg-neutral-50`, pill buttons that invert on hover, a
 * `dark:` variant for every colour. This site has:
 *
 *   - no icons. The type is the icon.
 *   - no radii, no fills, no pills. There are exactly three interactive
 *     objects and all three are a word with a rule under it.
 *   - no `dark:` classes. Ground is declared once per section as `.on-ink`
 *     or `.on-paper` and every recipe reads `--fg-*` from it, so a card
 *     does not need to know which half of the page it is on.
 *   - no `neutral-900`. The ramp is a token layer, and a hardcoded grey is
 *     how a page stops being able to invert.
 *
 * A card here is a hairline and a stack. That is the whole treatment, and
 * it is the same one the fit guide and the policies pages use — this block
 * had to join the site rather than the site accommodating the block.
 *
 * The copy is the studio's real desks, from lib/pages.ts. The stock strings
 * were about demos, seats and an on-call engineer.
 */
export default function Contact12() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="on-ink section bg-ink">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="stack stack--sm">
            <motion.p variants={item} className="t-eyebrow">
              {contact.routes.eyebrow}
            </motion.p>
            <motion.h2 variants={item} className="t-display-lg">
              {contact.routes.heading}
            </motion.h2>
            <motion.p
              variants={item}
              className="t-body t-body--lede mt-2 max-w-xl"
            >
              {contact.routes.body}
            </motion.p>
          </div>

          {/* The one number on the page. It stays because a reply time is
              the only thing a reader actually wants to know before writing,
              and it is set in the display face at display size for the same
              reason — it is an argument, not a statistic. */}
          <motion.div variants={item} className="shrink-0 lg:pb-2 lg:text-right">
            <p className="t-display-xs tabular-nums">
              {contact.routes.figure}
            </p>
            <p className="t-caption mt-2">{contact.routes.figureNote}</p>
          </motion.div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3"
        >
          {contact.routes.items.map((route) => (
            <motion.div
              key={route.title}
              variants={item}
              /* A rule above, and air below. No box: a card outline around
                 six items on a black page is six boxes, and the grid is
                 already saying they are a set. */
              className="flex flex-col border-t border-[var(--fg-rule)] pt-6"
            >
              <p className="t-eyebrow">{route.index}</p>
              <h3 className="t-display-xs mt-4">{route.title}</h3>
              <p className="t-body t-body--tight mt-3">{route.description}</p>
              <div className="mt-auto pt-8">
                {/* `as const` narrows each route to its own literal shape,
                    so only the one route that carries `external` has the
                    key at all. */}
                <CtaLink
                  href={route.href}
                  external={"external" in route ? route.external : undefined}
                >
                  {route.cta}
                </CtaLink>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
