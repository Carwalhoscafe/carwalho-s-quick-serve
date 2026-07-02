import { ChevronRight, RotateCcw } from "lucide-react";
import { PRODUCTS } from "@/lib/cart";

type OrderItem = { product_id: string; product_name: string; qty: number };

export type OrderSummary = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  order_status: string;
  order_type: string;
  estimated_delivery_label: string | null;
  items: OrderItem[];
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pending",          className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  confirmed:  { label: "Confirmed",        className: "bg-primary/15 text-primary border-primary/30" },
  preparing:  { label: "Preparing",        className: "bg-primary/15 text-primary border-primary/30" },
  out_for_delivery: { label: "Out for delivery", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  delivered:  { label: "Delivered",        className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  cancelled:  { label: "Cancelled",        className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function itemImage(productId: string): string | null {
  return PRODUCTS.find((p) => p.id === productId)?.image ?? null;
}

function itemsSummary(items: OrderItem[]): string {
  if (items.length === 0) return "";
  const names = items.map((i) => i.product_name);
  if (names.length <= 2) return names.join(", ");
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
}

export function OrderCard({
  order,
  onView,
  onReorder,
}: {
  order: OrderSummary;
  onView: () => void;
  onReorder: () => void;
}) {
  const placed = new Date(order.created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const thumbs = order.items.slice(0, 4);
  const extra = Math.max(0, order.items.length - thumbs.length);

  return (
    <article className="group rounded-2xl border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/40 hover:bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={order.order_status} />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {order.order_type === "pickup" ? "Pickup" : "Delivery"}
            </span>
          </div>
          <p className="mt-2 text-sm text-cream/90">Order #{order.order_number}</p>
          <p className="text-xs text-muted-foreground">{placed}</p>
          {order.estimated_delivery_label && order.order_status !== "delivered" && order.order_status !== "cancelled" && (
            <p className="mt-1 text-xs text-primary">ETA · {order.estimated_delivery_label}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
            ₹{Number(order.total).toFixed(0)}
          </p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {order.items.reduce((s, i) => s + i.qty, 0)} item{order.items.reduce((s, i) => s + i.qty, 0) === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4">
        <div className="flex -space-x-3">
          {thumbs.map((it, idx) => {
            const src = itemImage(it.product_id);
            return (
              <div
                key={idx}
                className="h-12 w-12 overflow-hidden rounded-full border-2 border-card bg-muted ring-1 ring-border/60"
              >
                {src ? (
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">🥥</div>
                )}
              </div>
            );
          })}
          {extra > 0 && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-semibold text-foreground ring-1 ring-border/60">
              +{extra}
            </div>
          )}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm text-cream/85">{itemsSummary(order.items)}</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onReorder}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reorder
        </button>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View details <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
