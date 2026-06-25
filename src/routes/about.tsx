import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story - Carwalho's Cafe" },
      { name: "description", content: "A small, single-location shop in Pallavaram pressing sugarcane and cracking tender coconuts the old-fashioned way." },
      { property: "og:title", content: "Our Story - Carwalho's Cafe" },
      { property: "og:description", content: "A small, single-location shop in Pallavaram." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-16 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Our Story</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">A small shop with one obsession.</h1>
        </div>
      </div>

      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16 text-lg leading-relaxed text-cream/90">
        <p>
          Carwalho&apos;s Cafe is a single counter in Alagappa Nagar, Pallavaram -
          a steel kettle, a wooden press, and a chalkboard menu in gold script.
        </p>
        <p>
          Every drink is made to order. Sugarcane is handpicked, washed, and cold-pressed
          the same morning. Tender coconuts arrive fresh from Pondicherry and Pollachi.
          No concentrates, no syrups, nothing artificial.
        </p>
        <p>
          We deliver across a tight 5 km radius so every order reaches you while it&apos;s
          still cold from the press. That&apos;s the whole idea.
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}
