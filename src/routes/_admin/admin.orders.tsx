import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listAllOrders, updateOrderStatus, type OrderStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/orders")({
  head: () => ({
    meta: [
      { title: "Admin - Orders | Carwalho's Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOrdersPage,
});

const STATUSES: OrderStatus[] = ["confirmed", "preparing", "ready", "completed", "cancelled"];

const statusClass: Record<OrderStatus, string> = {
  confirmed: "bg-primary/15 text-primary",
  preparing: "bg-amber-500/15 text-amber-400",
  ready: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-cream/15 text-cream/70",
  cancelled: "bg-red-500/15 text-red-400",
};

type Filter = "active" | "all" | "completed";

function AdminOrdersPage() {
  const [filter, setFilter] = useState<Filter>("active");
  const qc = useQueryClient();
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAllOrders(),
    refetchInterval: 30_000,
  });

  const mutate = useMutation({
    mutationFn: (v: { order_id: string; status: OrderStatus }) =>
      updateOrderStatus({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  const filtered = (orders ?? []).filter((o) => {
    if (filter === "all") return true;
    if (filter === "completed") return o.order_status === "completed" || o.order_status === "cancelled";
    return o.order_status !== "completed" && o.order_status !== "cancelled";
  });

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Admin</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">Orders</h1>
          <div className="mt-6 inline-flex rounded-full border border-border/70 bg-card/60 p-1 text-xs">
            {(["active", "all", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 uppercase tracking-widest transition-colors ${
                  filter === f ? "bg-primary text-primary-foreground" : "text-cream/70 hover:text-cream"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {isLoading ? (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-10 text-center text-cream/70">
            Loading orders...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            {(error as Error).message}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/60 p-10 text-center text-cream/70">
            No orders in this view.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/60">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">When</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">ETA</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-cream">
                {filtered.map((o) => (
                  <tr key={o.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{o.order_number}</div>
                      {o.notes && (
                        <div className="mt-1 max-w-[200px] truncate text-xs text-muted-foreground" title={o.notes}>
                          📝 {o.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-cream/80">
                      {new Date(o.created_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div>{o.customer_name}</div>
                      <a
                        href={`tel:${o.customer_phone}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {o.customer_phone}
                      </a>
                      {o.delivery_address && (
                        <div className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                          {o.delivery_address}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <ul className="space-y-0.5 text-xs">
                        {o.items.map((i, idx) => (
                          <li key={idx}>
                            {i.product_name} <span className="text-muted-foreground">× {i.qty}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <div className="capitalize">{o.order_type}</div>
                      {o.order_type === "delivery" && o.delivery_distance_km != null && (
                        <div className="text-muted-foreground">
                          {Number(o.delivery_distance_km).toFixed(1)} km
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-cream/90">
                      {o.estimated_delivery_label ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <div>{o.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"}</div>
                      <div className="text-muted-foreground capitalize">{o.payment_status}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-base text-primary" style={{ fontFamily: "var(--font-display)" }}>
                        ₹{Number(o.total).toFixed(0)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${statusClass[o.order_status as OrderStatus] ?? ""}`}
                      >
                        {o.order_status}
                      </span>
                      <select
                        value={o.order_status}
                        disabled={mutate.isPending}
                        onChange={(e) =>
                          mutate.mutate({
                            order_id: o.id,
                            status: e.target.value as OrderStatus,
                          })
                        }
                        className="mt-2 block w-full rounded-md border border-border/70 bg-background px-2 py-1 text-xs text-cream"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">Auto-refreshes every 30 seconds.</p>
      </section>

      <SiteFooter />
    </div>
  );
}
