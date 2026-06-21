import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Carwalho's Cafe" },
      { name: "description", content: "When and how Carwalho's Cafe issues refunds." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <PolicyPage title="Refund Policy">
      <p>
        Carwalho&apos;s Cafe sells fresh, perishable beverages. As a general rule, all sales are final
        once the order is dispatched. Refunds are issued only in the specific situations described below
        and are subject to verification by Carwalho&apos;s Cafe in its sole discretion.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. Eligible Situations</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>The business is unable to deliver your order due to unavailability, operational issues, weather, force majeure or any other reason.</li>
        <li>The business cancels your order at its discretion (see our Cancellation Policy).</li>
        <li>Significant delay in delivery caused by us where the product is no longer fit for consumption on arrival.</li>
        <li>Wrong item delivered, verified by us through photo evidence shared by you within 30 minutes of delivery.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">2. Owner&apos;s Discretion</h2>
      <p>
        The business owner reserves the absolute right to cancel any order at any time and to issue a
        refund. In such cases, the full amount paid will be refunded to the original payment method
        within <strong>5 working days</strong> from the date the cancellation is confirmed by us.
      </p>

      <h2 className="pt-4 text-2xl text-cream">3. Non-Refundable Situations</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Change of mind after the order is dispatched.</li>
        <li>Customer not reachable, address incorrect, or no one available to receive the order.</li>
        <li>Minor variations in taste, sweetness, colour or volume that are natural to fresh produce.</li>
        <li>Complaints raised after 30 minutes from delivery without supporting evidence.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">4. How to Request a Refund</h2>
      <p>
        Write to support@carwalhoscafe.in or call +91 93426 23521 with your order ID and a clear
        description of the issue. We will review and respond within 2 working days.
      </p>

      <h2 className="pt-4 text-2xl text-cream">5. Processing Time</h2>
      <p>
        Approved refunds will be credited to the original payment method within 5 working days.
        Actual credit time depends on your bank or payment provider.
      </p>

      <h2 className="pt-4 text-2xl text-cream">6. Final Decision</h2>
      <p>
        All refund decisions are made at the sole discretion of Carwalho&apos;s Cafe and are final.
      </p>
    </PolicyPage>
  );
}
