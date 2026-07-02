import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OrderCard } from "@/components/OrderCard";
import { OrderDetailDrawer, type OrderDetail } from "@/components/OrderDetailDrawer";
import { listMyOrders } from "@/lib/orders.functions";
import { useCart } from "@/lib/cart";

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

function OrdersPage() {
  const { data: orders } = useSuspenseQuery(ordersQuery);
  const { reorder } = useCart();
  const [openId, setOpenId] = useState<string | null>(null);

  const active = orders.find((o) => o.id === openId) ?? null;

  function handleReorder(o: OrderDetail | (typeof orders)[number]) {
    const items = o.items.map((i) => ({ product_id: i.product_id, qty: i.qty }));
    const added = reorder(items);
    if (added === 0) {
      toast.error("These items are no longer on the menu.");
    } else {
      toast.success(`Added ${added} item${added === 1 ? "" : "s"} to your cart.`);
      setOpenId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">My account</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            Your orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track past orders, view the full bill, or reorder in one tap.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 p-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-4 text-xl text-cream" style={{ fontFamily: "var(--font-display)" }}>
              No orders yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              When you place your first order, it'll show up here so you can track it and reorder any time.
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id}>
                <OrderCard
                  order={o}
                  onView={() => setOpenId(o.id)}
                  onReorder={() => handleReorder(o)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <OrderDetailDrawer
        order={active as OrderDetail | null}
        open={openId !== null}
        onOpenChange={(v) => !v && setOpenId(null)}
        onReorder={handleReorder}
      />

      <SiteFooter />
    </div>
  );
}
