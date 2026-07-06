import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_order",
  title: "Get order details",
  description: "Fetch full details (items, bill, status) of one of the signed-in user's orders by order number.",
  inputSchema: {
    order_number: z.string().min(1).describe("Order number, e.g. CC-20260706-ABCDE"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ order_number }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, created_at, order_type, order_status, payment_status, payment_method, subtotal, delivery_fee, total, delivery_address, delivery_distance_km, estimated_delivery_label, notes")
      .eq("order_number", order_number)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!order) return { content: [{ type: "text", text: `Order ${order_number} not found` }], isError: true };
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, qty, unit_price, line_total")
      .eq("order_id", order.id);
    const result = { ...order, items: items ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: { order: result },
    };
  },
});
