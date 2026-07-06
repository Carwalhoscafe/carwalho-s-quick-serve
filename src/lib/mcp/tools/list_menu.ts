import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const MENU = [
  { id: "sugarcane-juice-1l", name: "Sugarcane Juice", price: 120, unit: "per 1 litre", description: "Cold-pressed daily from handpicked cane." },
  { id: "coconut-pondicherry-small", name: "Tender Coconut - Pondicherry (Regular)", price: 50, unit: "per piece", description: "Naturally hydrating, straight from the coast." },
  { id: "coconut-pondicherry-large", name: "Tender Coconut - Pondicherry (Large)", price: 70, unit: "per piece", description: "A bigger Pondicherry coconut - more water, more refreshment." },
  { id: "coconut-pollachi", name: "Tender Coconut - Pollachi", price: 80, unit: "per piece", description: "Larger, sweeter Pollachi variety - naturally rich and creamy." },
];

export default defineTool({
  name: "list_menu",
  title: "List menu",
  description: "List the current Carwalho's Cafe menu with prices in INR.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(MENU, null, 2) }],
    structuredContent: { items: MENU },
  }),
});
