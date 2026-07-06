import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listMenu from "./tools/list_menu";
import listMyOrders from "./tools/list_my_orders";
import getOrder from "./tools/get_order";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "carwalhos-cafe-mcp",
  title: "Carwalho's Cafe",
  version: "0.1.0",
  instructions:
    "Tools for Carwalho's Cafe. Use `list_menu` for the current menu and prices. Use `list_my_orders` and `get_order` to look up the signed-in customer's orders.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMenu, listMyOrders, getOrder],
});
