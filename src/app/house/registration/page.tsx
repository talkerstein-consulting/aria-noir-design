import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { MailtoForm } from "@/components/page/mailto-form";
import { allHouses } from "@/lib/navigation";
import { registration } from "@/lib/maison";

export const metadata: Metadata = {
  alternates: { canonical: "/house/registration" },
  title: "Register your frame | Aria Noir",
  description: "Register your frame against the warranty. A numbered digital certificate of authenticity will follow.",
};

/**
 * Registration / Warranty, a footer page per the team call (5 Nov 2026).
 *
 * The form opens a letter to the support desk with every field filled in,
 * the same honest hand-off the contact intake makes: there is no endpoint
 * behind this build. The frame list is read from the catalogue, so a house
 * added there appears here without a second edit.
 */
const FRAMES = allHouses.map((h) => h.name);

export default function RegistrationPage() {
  const f = registration.fields;
  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main id="main" tabIndex={-1} className="relative">
        <PageHero eyebrow="Maison" title={registration.title} line={registration.line} />
        <section aria-label="Registration" className="on-ink section bg-ink">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              {registration.body.map((p) => (
                <p key={p} className="t-body t-body--lede">
                  {p}
                </p>
              ))}
              <p className="t-body">
                <Link href={registration.warrantyLink.href} className="link-quiet link-quiet--accent">
                  {registration.warrantyLink.label}
                </Link>
              </p>
            </div>
            <div className="border border-[var(--fg-rule)] p-6 sm:p-10">
              <MailtoForm
                to={registration.to}
                subject={registration.subject}
                send={registration.send}
                sent={registration.sent}
                fallback={registration.fallback}
                fields={[
                  { name: "name", label: f.name, required: true, autoComplete: "name", half: true },
                  { name: "email", label: f.email, type: "email", required: true, autoComplete: "email", half: true },
                  { name: "frame", label: f.frame, type: "select", required: true, options: FRAMES, half: true },
                  { name: "colourway", label: f.colourway, required: true, half: true },
                  { name: "order", label: f.order, required: true, half: true },
                  { name: "date", label: f.date, type: "date", required: true, half: true },
                ]}
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
