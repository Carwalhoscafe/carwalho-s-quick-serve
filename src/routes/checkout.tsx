import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart, MIN_ORDER_VALUE } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Carwalho's Cafe" },
      { name: "description", content: "Place your sugarcane juice and tender coconut delivery order." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { withProducts, subtotal } = useCart();
  const belowMin = subtotal < MIN_ORDER_VALUE;

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Checkout</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">Almost there.</h1>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-12">
        {withProducts.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-10 text-center">
            <p className="text-cream">Your cart is empty.</p>
            <Link to="/menu" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Browse the menu →
            </Link>
          </div>
        ) : belowMin ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            Minimum order is ₹{MIN_ORDER_VALUE}. Please go back and add more.
          </div>
        ) : (
          <div className="space-y-6 rounded-2xl border border-border/70 bg-card/60 p-8">
            <h2 className="text-2xl text-cream">Order summary</h2>
            <ul className="divide-y divide-border/60 text-sm">
              {withProducts.map(({ product, qty, lineTotal }) => (
                <li key={product.id} className="flex justify-between py-3 text-cream">
                  <span>
                    {product.name} <span className="text-muted-foreground">× {qty}</span>
                  </span>
                  <span className="font-semibold">₹{lineTotal}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-border/60 pt-4 text-cream">
              <span>Subtotal</span>
              <span className="text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
                ₹{subtotal}
              </span>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm text-cream/90">
              <p className="font-semibold text-primary">Checkout is being set up.</p>
              <p className="mt-1 text-muted-foreground">
                Address picker, delivery slot, and Razorpay payment are coming in the next step.
                For now, call <a href="tel:+919342623521" className="text-primary hover:underline">+91 93426 23521</a>{" "}
                to place your order.
              </p>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
