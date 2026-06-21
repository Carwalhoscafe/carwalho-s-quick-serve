import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ArrowRight, Phone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart, MIN_ORDER_VALUE, BULK_THRESHOLD } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Carwalho's Cafe" },
      { name: "description", content: "Review your sugarcane juice and tender coconut order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { withProducts, setQty, remove, subtotal, clear } = useCart();
  const isEmpty = withProducts.length === 0;
  const belowMin = subtotal > 0 && subtotal < MIN_ORDER_VALUE;
  const isBulk = subtotal >= BULK_THRESHOLD;

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Your Cart</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">Review your order.</h1>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {isEmpty ? (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-12 text-center">
            <p className="text-lg text-cream">Your cart is empty.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a few drinks from the menu to get started.
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Browse the menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card/40">
              {withProducts.map(({ product, qty, lineTotal }) => (
                <li key={product.id} className="flex flex-wrap items-center justify-between gap-6 p-6">
                  <div className="min-w-0">
                    <h2 className="text-lg text-cream">{product.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      ₹{product.price} · {product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-3 rounded-full border border-primary/60 bg-background/40 p-1.5">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        aria-label="Decrease quantity"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-cream hover:bg-primary/10"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold text-cream">{qty}</span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        aria-label="Increase quantity"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-[1.05]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="w-20 text-right text-base font-semibold text-cream">
                      ₹{lineTotal}
                    </div>

                    <button
                      onClick={() => remove(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <aside className="h-fit rounded-2xl border border-border/70 bg-card/60 p-6">
              <h3 className="text-xs uppercase tracking-[0.3em] text-primary">Order Summary</h3>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-cream">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold">₹{subtotal}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Delivery</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-border/60 pt-5">
                <div className="flex justify-between text-base">
                  <span className="text-cream">Total</span>
                  <span
                    className="text-2xl text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    ₹{subtotal}
                  </span>
                </div>
              </div>

              {belowMin && (
                <p className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  Minimum order is ₹{MIN_ORDER_VALUE}. Add ₹{MIN_ORDER_VALUE - subtotal} more to checkout.
                </p>
              )}

              {isBulk && (
                <div className="mt-5 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-cream">
                  <p className="font-semibold">Big order? Call us directly.</p>
                  <p className="mt-1 text-muted-foreground">
                    For orders above ₹{BULK_THRESHOLD}, we can sort timing and pricing personally.
                  </p>
                  <a
                    href="tel:+919342623521"
                    className="mt-2 inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" /> +91 93426 23521
                  </a>
                </div>
              )}

              <Link
                to="/checkout"
                disabled={belowMin}
                aria-disabled={belowMin}
                onClick={(e) => {
                  if (belowMin) e.preventDefault();
                }}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform ${
                  belowMin
                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:scale-[1.02]"
                }`}
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={clear}
                className="mt-3 w-full text-xs text-muted-foreground hover:text-destructive"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
