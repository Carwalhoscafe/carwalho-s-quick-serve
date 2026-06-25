import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, MapPin, Clock, Sparkles, Minus, Plus, ShoppingBag, MapPinned, Truck } from "lucide-react";

import heroAsset from "@/assets/carwalhos-hero.png.asset.json";
import socialAsset from "@/assets/carwalhos-social.png.asset.json";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PRODUCTS, useCart } from "@/lib/cart";


export const Route = createFileRoute("/")({
  head: () => {
    const siteUrl = "https://carwalhos-juice-delivery.lovable.app";
    const title = "Sugarcane Juice & Tender Coconut Delivery in Chennai | Carwalho's Cafe";
    const description = "Order fresh sugarcane juice and tender coconut water online in Pallavaram, Chennai. Hand-pressed daily, same-day delivery (Mon-Fri, 10am-2pm) for homes, offices, and events.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: `${siteUrl}${socialAsset.url}` },
        { property: "og:url", content: siteUrl },
        { property: "og:type", content: "website" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: `${siteUrl}${socialAsset.url}` },
      ],
      links: [{ rel: "canonical", href: siteUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: siteUrl,
            name: "Carwalho's Cafe",
            description,
          }),
        },
      ],
    };
  },
  component: Home,
});


const valueProps = [
  { icon: Sparkles, title: "Freshly Prepared", body: "Made fresh daily from premium tender coconuts and hand-selected sugarcane." },
  { icon: MapPin, title: "Event & Office Delivery", body: "Reliable delivery for offices, meetings, schools, events, and community gatherings." },
  { icon: Clock, title: "Advance Booking Available", body: "Schedule your delivery in advance and receive fresh drinks exactly when needed." },
  { icon: Leaf, title: "Healthy Hydration", body: "A natural alternative to soft drinks, packed with freshness and goodness." },
];

function Home() {
  const { add, setQty, items } = useCart();
  const qtyFor = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;

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
          <p className="text-xs uppercase tracking-[0.4em] text-primary">
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((item) => {
            const qty = qtyFor(item.id);
            return (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-colors hover:border-primary/60"
              >
                <div className="aspect-square w-full overflow-hidden bg-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="min-h-[3.5rem] text-lg leading-tight text-cream">{item.name}</h3>
                  <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/60 pt-5">
                    <div>
                      <span
                        className="text-2xl text-primary"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        ₹{item.price}
                      </span>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {item.unit}
                      </p>
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => add(item.id, 1)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/60 bg-card/80 p-1">
                        <button
                          onClick={() => setQty(item.id, qty - 1)}
                          aria-label="Decrease quantity"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-cream hover:bg-primary/10"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-5 text-center text-sm font-semibold text-cream">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(item.id, qty + 1)}
                          aria-label="Increase quantity"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-[1.05]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </section>

      {/* ── Section 4 · How it works ────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border/60 bg-gradient-to-b from-card/40 via-background to-card/30">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] translate-x-1/3 translate-y-1/3 rounded-full bg-secondary/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary">How it Works</p>
            <h2
              className="mt-4 text-4xl leading-[1.1] text-cream md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three sips. <span className="italic text-primary">One fresh</span> delivery.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
              From our press to your doorstep in the same morning. No preservatives, no waiting around.
            </p>
          </div>

          <ol className="relative mt-20 grid gap-8 md:grid-cols-3 md:gap-6">
            {/* Connecting dotted line on desktop */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-12 hidden h-px md:block"
              style={{
                backgroundImage:
                  "linear-gradient(to right, hsl(var(--primary) / 0.5) 50%, transparent 0%)",
                backgroundSize: "10px 1px",
                backgroundRepeat: "repeat-x",
              }}
            />

            {[
              {
                n: "01",
                icon: ShoppingBag,
                t: "Pick your drinks",
                d: "Browse our focused menu of sugarcane juice and tender coconut. Add what you love to the cart.",
              },
              {
                n: "02",
                icon: MapPinned,
                t: "Drop a pin",
                d: "Share your address - we instantly check you're inside our 5 km delivery zone in Pallavaram.",
              },
              {
                n: "03",
                icon: Truck,
                t: "We deliver fresh",
                d: "Pressed, packed, and dispatched the same morning of your chosen delivery slot.",
              },
            ].map(({ n, icon: Icon, t, d }) => (
              <li key={n} className="group relative">
                <div className="relative flex h-full flex-col items-center rounded-3xl border border-border/70 bg-card/70 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10">
                  {/* Step number badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/30 blur-md transition-opacity group-hover:opacity-100" />
                      <span
                        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/60 bg-background text-sm font-semibold tracking-widest text-primary"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {n}
                      </span>
                    </div>
                  </div>

                  <Icon
                    className="mt-6 h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.25}
                  />

                  <h3
                    className="mt-6 text-2xl text-cream"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {t}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-16 flex justify-center">
            <Link
              to="/menu"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] hover:shadow-primary/40"
            >
              Start your order
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
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
                give us a call - we&apos;ll sort it out personally.
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
