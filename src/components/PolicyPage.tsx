import { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface PolicyPageProps {
  eyebrow?: string;
  title: string;
  updated?: string;
  children: ReactNode;
}

export function PolicyPage({ eyebrow = "Legal", title, updated = "21 June 2026", children }: PolicyPageProps) {
  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
        </div>
      </div>

      <article className="policy-content mx-auto max-w-3xl space-y-5 px-6 py-14 text-base leading-relaxed text-cream/85">
        {children}
      </article>

      <SiteFooter />
    </div>
  );
}
