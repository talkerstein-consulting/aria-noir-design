import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageHero } from "@/components/page/page-hero";
import { ProsePage } from "@/components/page/prose-page";
import { policies } from "@/lib/policies";

/**
 * The five policy documents on one route.
 *
 * They differ only in their words, so five near-identical page files would
 * be five places to forget to update. `generateStaticParams` still gives
 * each one its own static HTML at build time, so this costs nothing at
 * runtime that five files would have saved.
 */
export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies.find((p) => p.slug === slug);
  if (!policy) return {};
  return {
    title: `${policy.title} — Aria Noir`,
    description: `${policy.title}. Last updated ${policy.updated}.`,
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = policies.find((p) => p.slug === slug);
  if (!policy) notFound();

  return (
    <>
      <SmoothScroll />
      <SiteNav />
      <main className="relative">
        {/* No plate. These pages open on type over ink and are better for
            it — a warranty set over campaign photography is a page asking
            to be admired while someone is trying to find out whether their
            hinge is covered. The house voice survives in the type. */}
        <PageHero eyebrow={policy.eyebrow} title={policy.title} />
        <ProsePage updated={policy.updated} sections={policy.sections} />
      </main>
      <SiteFooter tone="ink" />
    </>
  );
}
