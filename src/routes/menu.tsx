import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Carwalho's Cafe" },
      { name: "description", content: "Fresh sugarcane juice and tender coconut, priced per piece and per litre. Order for delivery in Pallavaram." },
      { property: "og:title", content: "Menu — Carwalho's Cafe" },
      { property: "og:description", content: "Fresh sugarcane juice and tender coconut, priced per piece and per litre." },
    ],
  }),
  component: MenuPage,
});

const menu = [
  { name: "Tender Coconut — Pondicherry", price: 50, unit: "per piece", desc: "Naturally hydrating, straight from the coast." },
  { name: "Tender Coconut — Pollachi", price: 70, unit: "per piece", desc: "Larger, sweeter Pollachi variety." },
  { name: "Sugarcane Juice", price: 120, unit: "per 1 litre", desc: "Cold-pressed daily from handpicked cane." },
];

function MenuPage() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-16 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">The Menu</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">Today&apos;s pressings.</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            A small, focused selection — pressed and packed fresh on the morning of your delivery.
            Minimum order ₹300. Delivery free within 5 km.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <ul className="divide-y divide-border/60">
          {menu.map((item) => (
            <li key={item.name} className="flex flex-wrap items-baseline justify-between gap-4 py-8">
              <div className="max-w-xl">
                <h2 className="text-2xl text-cream">{item.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  ₹{item.price}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.unit}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 rounded-xl border border-primary/30 bg-card/60 p-5 text-sm text-muted-foreground">
          Online ordering & checkout coming next. For now, call{" "}
          <a href="tel:+919342623521" className="font-semibold text-primary">+91 93426 23521</a>{" "}
          to place your order.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
