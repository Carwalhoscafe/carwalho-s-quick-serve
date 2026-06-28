import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ORDER_STATUSES = ["confirmed", "preparing", "ready", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) return { isAdmin: false };
    return { isAdmin: !!data };
  });

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data: orders, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, created_at, total, subtotal, delivery_fee, order_status, payment_status, payment_method, order_type, customer_name, customer_phone, customer_email, delivery_address, delivery_distance_km, notes",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const ids = (orders ?? []).map((o) => o.id);
    let items: { order_id: string; product_name: string; qty: number; line_total: number }[] = [];
    if (ids.length) {
      const { data: rows, error: iErr } = await context.supabase
        .from("order_items")
        .select("order_id, product_name, qty, line_total")
        .in("order_id", ids);
      if (iErr) throw new Error(iErr.message);
      items = rows ?? [];
    }
    return (orders ?? []).map((o) => ({
      ...o,
      items: items.filter((i) => i.order_id === o.id),
    }));
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      order_id: z.string().uuid(),
      status: z.enum(ORDER_STATUSES),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("orders")
      .update({ order_status: data.status })
      .eq("id", data.order_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
