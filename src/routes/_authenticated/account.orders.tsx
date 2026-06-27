import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listMyOrders } from "@/lib/orders.functions";

const ordersQuery = queryOptions({
  queryKey: ["my-orders"],
  queryFn: () => listMyOrders(),
});

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({
    meta: [
      { title: "My orders - Carwalho's Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(ordersQuery),
  component: OrdersPage,
});

function statusColor(s: string) {
  if (s === "delivered") return "text-emerald-400";
  if (s === "cancelled") return "text-red-400";
  return "text-primary";
}

function OrdersPage() {
  const { data: orders } = useSuspenseQuery(ordersQuery);

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">My account</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">Your orders</h1>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-10 text-center">
            <p className="text-cream">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-border/70 bg-card/60 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
                    <p className="text-lg text-cream">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
                      ₹{Number(o.total).toFixed(0)}
                    </p>
                    <p className={`text-xs uppercase tracking-widest ${statusColor(o.order_status)}`}>
                      {o.order_status}
                    </p>
                  </div>
                </div>
                {o.items?.length > 0 && (
                  <ul className="mt-3 divide-y divide-border/60 text-sm text-cream/90">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between py-2">
                        <span>{i.product_name}</span>
                        <span className="text-muted-foreground">× {i.qty}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Payment: {o.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"} · {o.payment_status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
