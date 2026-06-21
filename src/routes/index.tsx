import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, MapPin, Clock, Sparkles, Minus, Plus } from "lucide-react";

import heroAsset from "@/assets/carwalhos-hero.png.asset.json";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PRODUCTS, useCart } from "@/lib/cart";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Carwalho's Cafe — Fresh Sugarcane Juice & Tender Coconut, Delivered" },
      {
        name: "description",
        content:
          "Hand-pressed sugarcane juice and tender coconut water from Pallavaram, Chennai. Order online for same-day delivery within 5 km, Mon–Fri 10am–2pm.",
      },
      { property: "og:title", content: "Carwalho's Cafe — Fresh Sugarcane Juice & Tender Coconut" },
      {
        property: "og:description",
        content:
          "Fresh sugarcane juice & tender coconut, delivered to your door across Pallavaram.",
      },
      { property: "og:image", content: heroAsset.url },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

const featuredMenu = [
  {
    name: "Sugarcane Juice",
    description: "Cold-pressed daily from handpicked cane. One full litre.",
    price: "₹120",
    unit: "/ litre",
  },
  {
    name: "Tender Coconut — Pondicherry",
    description: "Naturally hydrating, straight from the coast.",
    price: "₹50",
    unit: "/ piece",
  },
  {
    name: "Tender Coconut — Pollachi",
    description: "Larger, sweeter Pollachi variety. Pure refreshment.",
    price: "₹70",
    unit: "/ piece",
  },
];

const valueProps = [
  { icon: Sparkles, title: "Pressed to Order", body: "Every drink made fresh — no concentrates, no shortcuts." },
  { icon: MapPin, title: "5 km Delivery", body: "Free delivery across Pallavaram and surrounding lanes." },
  { icon: Clock, title: "Mon – Fri · 10–2", body: "Order before 10 AM for same-day delivery." },
  { icon: Leaf, title: "100% Natural", body: "Handpicked cane and coconut. Nothing else added." },
];

function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Section 1 · Hero illustration ───────────────────────────── */}
      <section className="relative isolate min-h-[100vh] w-full overflow-hidden">
        <SiteHeader />

        <img
          src={heroAsset.url}
          alt="Carwalho's Cafe shopkeeper in an orange jacket pouring fresh sugarcane juice from a steel kettle, surrounded by stacked tender coconuts, hanging bananas, and a chalkboard sign on a deep teal wall."
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />

        {/* Vignette + bottom gradient for legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent"
        />

        <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-40">
          <p className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-primary">
            <span className="h-px w-10 bg-primary/60" />
            Crafted Fresh Everyday
          </p>
          <h1
            className="mt-5 max-w-3xl text-5xl leading-[1.05] text-cream md:text-7xl"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Carwalho&apos;s Cafe
          </h1>
          <p
            className="mt-4 max-w-2xl text-2xl leading-snug text-cream/90 md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Fresh Sugarcane Juice & Tender Coconut,
            <br className="hidden sm:block" /> delivered to your door.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-black/40 transition-transform hover:scale-[1.03]"
            >
              Order Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-primary/60 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-primary/10"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 2 · Value strip ─────────────────────────────────── */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {valueProps.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-start gap-3">
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-lg text-cream">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3 · Featured menu ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary">The Menu</p>
            <h2 className="mt-3 max-w-xl text-4xl text-cream md:text-5xl">
              Rooted in freshness.
              <br />
              Designed for everyday.
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
          >
            View full menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featuredMenu.map((item) => (
            <article
              key={item.name}
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-7 transition-colors hover:border-primary/60"
            >
              <div>
                <h3 className="text-2xl text-cream">{item.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="mt-8 flex items-baseline justify-between border-t border-border/60 pt-5">
                <span className="text-3xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  {item.price}
                </span>
                <span className="text-sm text-muted-foreground">{item.unit}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Section 4 · How it works ────────────────────────────────── */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">How it Works</p>
          <h2 className="mt-3 max-w-2xl text-4xl text-cream md:text-5xl">
            Three steps to a fresh-pressed delivery.
          </h2>

          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { n: "01", t: "Pick your drinks", d: "Browse the small, focused menu and add to your cart." },
              { n: "02", t: "Drop a pin", d: "Share your address — we check you're inside our 5 km zone." },
              { n: "03", t: "We deliver fresh", d: "Pressed and packed the morning of your delivery slot." },
            ].map((s) => (
              <li key={s.n} className="border-t border-primary/40 pt-6">
                <span
                  className="block text-5xl text-primary/80"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 text-xl text-cream">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Section 5 · Bulk CTA ────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-secondary/40 via-card to-card p-10 md:p-16">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-primary">Bulk & Events</p>
              <h2 className="mt-3 text-3xl text-cream md:text-4xl">
                Hosting a gathering? Let&apos;s talk directly.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                For large orders or special timings outside our regular delivery window,
                give us a call — we&apos;ll sort it out personally.
              </p>
            </div>
            <a
              href="tel:+919342623521"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03]"
            >
              Call +91 93426 23521
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
