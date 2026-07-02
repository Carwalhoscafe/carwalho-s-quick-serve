import { Link } from "@tanstack/react-router";
import { MapPin, Phone, StickyNote, CreditCard, RotateCcw, LifeBuoy } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PRODUCTS } from "@/lib/cart";

export type OrderDetail = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  order_type: string;
  estimated_delivery_label: string | null;
  delivery_address: string | null;
  delivery_distance_km: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  items: {
    product_id: string;
    product_name: string;
    qty: number;
    unit_price: number;
    line_total: number;
  }[];
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pending",          className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  confirmed:  { label: "Confirmed",        className: "bg-primary/15 text-primary border-primary/30" },
  preparing:  { label: "Preparing",        className: "bg-primary/15 text-primary border-primary/30" },
  out_for_delivery: { label: "Out for delivery", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  delivered:  { label: "Delivered",        className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  cancelled:  { label: "Cancelled",        className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const fmt = (n: number) => `₹${Number(n).toFixed(0)}`;

export function OrderDetailDrawer({
  order,
  open,
  onOpenChange,
  onReorder,
}: {
  order: OrderDetail | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReorder: (o: OrderDetail) => void;
}) {
  const status = order ? (STATUS_META[order.order_status] ?? { label: order.order_status, className: "bg-muted text-muted-foreground border-border" }) : null;
  const placed = order
    ? new Date(order.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric", month: "short", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      })
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-lg"
      >
        {order && (
          <>
            <SheetHeader className="space-y-2 border-b border-border px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                {status && (
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${status.className}`}>
                    {status.label}
                  </span>
                )}
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {order.order_type === "pickup" ? "Pickup" : "Delivery"}
                </span>
              </div>
              <SheetTitle className="text-lg font-semibold">Order #{order.order_number}</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Placed {placed}
                {order.estimated_delivery_label && ` · ETA ${order.estimated_delivery_label}`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Items</h3>
                <ul className="mt-3 space-y-3">
                  {order.items.map((it, idx) => {
                    const img = PRODUCTS.find((p) => p.id === it.product_id)?.image;
                    return (
                      <li key={idx} className="flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xl">🥥</div>}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="text-sm font-medium text-cream">{it.product_name}</p>
                          <p className="text-xs text-muted-foreground">{fmt(it.unit_price)} × {it.qty}</p>
                        </div>
                        <p className="self-center text-sm font-semibold text-cream">{fmt(it.line_total)}</p>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Bill details</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-cream/85"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                  <div className="flex justify-between text-cream/85"><span>Delivery fee</span><span>{order.delivery_fee > 0 ? fmt(order.delivery_fee) : "Free"}</span></div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-semibold text-cream"><span>Total</span><span>{fmt(order.total)}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {order.order_type === "pickup" ? "Pickup" : "Delivery"}
                </h3>
                <div className="mt-3 space-y-2 text-sm text-cream/85">
                  {order.delivery_address && (
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {order.delivery_address}
                        {order.delivery_distance_km != null && (
                          <span className="ml-1 text-xs text-muted-foreground">({order.delivery_distance_km.toFixed(1)} km)</span>
                        )}
                      </span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-primary" />
                    <span>{order.customer_name} · {order.customer_phone}</span>
                  </p>
                  {order.notes && (
                    <p className="flex items-start gap-2">
                      <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{order.notes}</span>
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Payment</h3>
                <p className="mt-3 flex items-center gap-2 text-sm text-cream/85">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay (online)"} · <span className="capitalize">{order.payment_status}</span>
                </p>
              </section>
            </div>

            <div className="grid gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onReorder(order)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4" /> Reorder
              </button>
              <Link
                to="/contact"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-muted"
              >
                <LifeBuoy className="h-4 w-4" /> Need help?
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
