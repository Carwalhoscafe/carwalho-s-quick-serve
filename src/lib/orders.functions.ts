import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { distanceFromShopKm, DELIVERY_RADIUS_KM } from "./geo";

const itemSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  unit_price: z.number().nonnegative(),
  qty: z.number().int().positive(),
});

const submitInput = z.object({
  customer_name: z.string().min(1).max(120),
  customer_phone: z.string().min(7).max(20),
  customer_email: z.string().email().optional().nullable(),
  order_type: z.enum(["delivery", "pickup"]).default("delivery"),
  delivery_address: z.string().max(500).optional().nullable(),
  delivery_lat: z.number().min(-90).max(90).optional().nullable(),
  delivery_lng: z.number().min(-180).max(180).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  payment_method: z.enum(["razorpay", "cod"]),
  items: z.array(itemSchema).min(1),
  delivery_fee: z.number().nonnegative().default(0),
});

function orderNumber() {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CC-${ymd}-${rand}`;
}

export const submitOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => submitInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const subtotal = data.items.reduce((s, i) => s + i.unit_price * i.qty, 0);
    const total = subtotal + (data.delivery_fee ?? 0);
    const number = orderNumber();

    // Server-side delivery radius gate (authoritative).
    let distanceKm: number | null = null;
    if (data.order_type === "delivery") {
      if (data.delivery_lat == null || data.delivery_lng == null) {
        throw new Error("Please choose your delivery address from the suggestions.");
      }
      if (!data.delivery_address) throw new Error("Delivery address is required.");
      distanceKm = distanceFromShopKm(data.delivery_lat, data.delivery_lng);
      if (distanceKm > DELIVERY_RADIUS_KM) {
        throw new Error(
          `Sorry, your address is ${distanceKm.toFixed(1)} km away. We only deliver within ${DELIVERY_RADIUS_KM} km of Pallavaram.`,
        );
      }
    }

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        order_number: number,
        user_id: userId,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email ?? (claims?.email as string | undefined) ?? null,
        order_type: data.order_type,
        delivery_address: data.delivery_address ?? null,
        delivery_lat: data.delivery_lat ?? null,
        delivery_lng: data.delivery_lng ?? null,
        delivery_distance_km: distanceKm,
        notes: data.notes ?? null,
        payment_method: data.payment_method,
        payment_status: data.payment_method === "cod" ? "pending" : "pending",
        order_status: "confirmed",
        subtotal,
        delivery_fee: data.delivery_fee ?? 0,
        total,
      })
      .select()
      .single();

    if (oErr || !order) throw new Error(oErr?.message ?? "Order insert failed");

    // Insert items via admin (bypass RLS for the join row creation under user context is fine
    // because RLS is INSERT-denied; use admin client server-side).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const itemsPayload = data.items.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.product_name,
      unit_price: i.unit_price,
      qty: i.qty,
      line_total: i.unit_price * i.qty,
    }));
    const { error: iErr } = await supabaseAdmin.from("order_items").insert(itemsPayload);
    if (iErr) throw new Error(iErr.message);

    // Fire-and-forget: emails + sheets
    try {
      const { sendEmail, appendSheetRow } = await import("./integrations.server");
      const { customerConfirmationEmail, adminNotificationEmail } = await import("./emails.server");

      const emailData = {
        orderNumber: number,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerEmail: order.customer_email,
        deliveryAddress: data.delivery_address ?? null,
        notes: data.notes ?? null,
        orderType: data.order_type,
        paymentMethod: data.payment_method === "cod" ? "Cash on Delivery" : "Razorpay (online)",
        items: data.items.map(i => ({
          name: i.product_name, qty: i.qty, unitPrice: i.unit_price, lineTotal: i.unit_price * i.qty,
        })),
        subtotal,
        deliveryFee: data.delivery_fee ?? 0,
        total,
        createdAt: order.created_at,
      };

      const promises: Promise<unknown>[] = [];
      if (order.customer_email) {
        promises.push(sendEmail({
          to: order.customer_email,
          subject: `Order ${number} confirmed - Carwalho's Cafe`,
          html: customerConfirmationEmail(emailData),
        }));
      }
      promises.push(sendEmail({
        to: "lawrance@carwalhoscafe.in",
        subject: `New order ${number} - Rs ${total}`,
        html: adminNotificationEmail(emailData),
      }));

      const d = new Date(order.created_at);
      const date = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
      const time = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
      const itemsStr = data.items.map(i => `${i.product_name} x${i.qty}`).join("; ");
      const qtyTotal = data.items.reduce((s, i) => s + i.qty, 0);
      promises.push(appendSheetRow("Orders", [
        number, date, time,
        data.customer_name, data.customer_phone, order.customer_email ?? "",
        data.order_type, itemsStr, qtyTotal, total,
        data.payment_method, "pending", "confirmed", data.notes ?? "",
      ]));

      await Promise.allSettled(promises);
    } catch (e) {
      console.error("[order] post-insert side effects failed", e);
    }

    return { ok: true, order_number: number, order_id: order.id };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: orders, error } = await context.supabase
      .from("orders")
      .select("id, order_number, created_at, total, order_status, payment_status, payment_method, order_type")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const ids = (orders ?? []).map(o => o.id);
    let items: { order_id: string; product_name: string; qty: number }[] = [];
    if (ids.length) {
      const { data: rows } = await context.supabase
        .from("order_items")
        .select("order_id, product_name, qty")
        .in("order_id", ids);
      items = rows ?? [];
    }
    return (orders ?? []).map(o => ({
      ...o,
      items: items.filter(i => i.order_id === o.id),
    }));
  });
