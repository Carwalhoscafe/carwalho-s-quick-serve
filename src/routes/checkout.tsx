import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart, MIN_ORDER_VALUE } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { submitOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Carwalho's Cafe" },
      { name: "description", content: "Place your sugarcane juice and tender coconut delivery order." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

type User = { id: string; email?: string | null } | null;

function CheckoutPage() {
  const { withProducts, subtotal, clear } = useCart();
  const belowMin = subtotal < MIN_ORDER_VALUE;
  const navigate = useNavigate();

  const [user, setUser] = useState<User | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ number: string } | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "razorpay">("cod");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true); setErr(null);
    try {
      const res = await submitOrder({
        data: {
          customer_name: name,
          customer_phone: phone,
          customer_email: user.email ?? null,
          order_type: "delivery",
          delivery_address: address,
          notes: notes || null,
          payment_method: payment,
          delivery_fee: 0,
          items: withProducts.map(({ product, qty }) => ({
            product_id: product.id,
            product_name: product.name,
            unit_price: product.price,
            qty,
          })),
        },
      });
      setDone({ number: res.order_number });
      clear();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

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
        {done ? (
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center">
            <p className="text-xs uppercase tracking-widest text-primary">Order confirmed</p>
            <h2 className="mt-2 text-3xl text-cream">{done.number}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We've emailed your confirmation. We'll prepare it fresh and dispatch it in our next slot.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/account/orders" className="rounded-full border border-primary/60 px-5 py-2 text-sm font-semibold text-cream hover:bg-primary/10">
                View my orders
              </Link>
              <Link to="/menu" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                Order again
              </Link>
            </div>
          </div>
        ) : withProducts.length === 0 ? (
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
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-8">
              <h2 className="text-2xl text-cream">Order summary</h2>
              <ul className="mt-4 divide-y divide-border/60 text-sm">
                {withProducts.map(({ product, qty, lineTotal }) => (
                  <li key={product.id} className="flex justify-between py-3 text-cream">
                    <span>{product.name} <span className="text-muted-foreground">× {qty}</span></span>
                    <span className="font-semibold">₹{lineTotal}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-border/60 pt-4 text-cream">
                <span>Total</span>
                <span className="text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>₹{subtotal}</span>
              </div>
            </div>

            {user === undefined ? (
              <div className="rounded-2xl border border-border/70 bg-card/60 p-8 text-sm text-muted-foreground">Loading...</div>
            ) : !user ? (
              <div className="rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center">
                <p className="text-cream">Please sign in to place your order.</p>
                <p className="mt-1 text-xs text-muted-foreground">Your cart will be waiting for you.</p>
                <button
                  onClick={() => navigate({ to: "/auth", search: { next: "/checkout" } })}
                  className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Sign in to continue
                </button>
              </div>
            ) : (
              <form onSubmit={placeOrder} className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-8">
                <h2 className="text-2xl text-cream">Delivery details</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"
                    className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
                  <input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone (+91...)"
                    type="tel" className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
                </div>
                <textarea required value={address} onChange={e=>setAddress(e.target.value)} rows={3}
                  placeholder="Delivery address (house no, street, area, pincode)"
                  className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                  placeholder="Notes (optional)"
                  className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />

                <fieldset className="space-y-2">
                  <legend className="text-xs uppercase tracking-widest text-muted-foreground">Payment</legend>
                  <label className="flex items-center gap-2 text-sm text-cream">
                    <input type="radio" name="pay" checked={payment==="cod"} onChange={()=>setPayment("cod")} /> Cash on Delivery
                  </label>
                  <label className="flex items-center gap-2 text-sm text-cream/70">
                    <input type="radio" name="pay" checked={payment==="razorpay"} onChange={()=>setPayment("razorpay")} disabled /> Razorpay (online) - coming soon
                  </label>
                </fieldset>

                {err && <p className="text-sm text-destructive">{err}</p>}

                <button disabled={submitting}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {submitting ? "Placing order..." : `Place order - ₹${subtotal}`}
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
