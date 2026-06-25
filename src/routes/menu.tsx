import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PRODUCTS, useCart, MIN_ORDER_VALUE } from "@/lib/cart";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu - Carwalho's Cafe" },
      { name: "description", content: "Fresh sugarcane juice and tender coconut, priced per piece and per litre. Order for delivery in Pallavaram." },
      { property: "og:title", content: "Menu - Carwalho's Cafe" },
      { property: "og:description", content: "Fresh sugarcane juice and tender coconut, priced per piece and per litre." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { add, setQty, items } = useCart();

  const qtyFor = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-16 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">The Menu</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">Today&apos;s pressings.</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            A small, focused selection - pressed and packed fresh on the morning of your delivery.
            Minimum order ₹{MIN_ORDER_VALUE}. Delivery within 5 km of Pallavaram.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <ul className="divide-y divide-border/60">
          {PRODUCTS.map((item) => {
            const qty = qtyFor(item.id);
            return (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-6 py-8">
                <div className="flex items-center gap-5">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="h-24 w-24 flex-none rounded-xl object-cover sm:h-28 sm:w-28"
                  />
                  <div className="max-w-xl">
                    <h2 className="text-2xl text-cream">{item.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-3xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
                      ₹{item.price}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.unit}</p>
                  </div>
                  {qty === 0 ? (
                    <button
                      onClick={() => add(item.id, 1)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-3 rounded-full border border-primary/60 bg-card/80 p-1.5">
                      <button
                        onClick={() => setQty(item.id, qty - 1)}
                        aria-label="Decrease quantity"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-cream hover:bg-primary/10"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold text-cream">{qty}</span>
                      <button
                        onClick={() => setQty(item.id, qty + 1)}
                        aria-label="Increase quantity"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-[1.05]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <SiteFooter />
    </div>
  );
}
