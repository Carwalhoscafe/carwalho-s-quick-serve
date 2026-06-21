import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Carwalho's Cafe" },
      { name: "description", content: "What our regulars in Pallavaram say about Carwalho's Cafe sugarcane juice and tender coconut." },
      { property: "og:title", content: "Reviews — Carwalho's Cafe" },
      { property: "og:description", content: "Real reviews from real Pallavaram regulars." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-16 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Reviews</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">Loved by our regulars.</h1>
          <p className="mt-4 text-muted-foreground">
            Reviews appear here after a customer&apos;s order is delivered and the shop approves their note.
            Be among the first — order today.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center text-muted-foreground">
        No published reviews yet.
      </section>

      <SiteFooter />
    </div>
  );
}
