import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy - Carwalho's Cafe" },
      { name: "description", content: "Delivery area, timings and conditions for Carwalho's Cafe orders." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <PolicyPage title="Shipping & Delivery Policy">
      <h2 className="pt-2 text-2xl text-cream">1. Delivery Area</h2>
      <p>
        We currently deliver within a <strong>5 km radius of our shop at Alagappa Nagar,
        Pallavaram, Chennai 600117</strong>. Orders to addresses outside this radius may be
        cancelled at our discretion.
      </p>

      <h2 className="pt-4 text-2xl text-cream">2. Delivery Timings</h2>
      <p>
        Orders are accepted from Monday to Friday between 10:00 AM and 2:00 PM. Orders placed
        outside these hours will be processed on the next working day.
      </p>

      <h2 className="pt-4 text-2xl text-cream">3. Delivery Time Estimates</h2>
      <p>
        Estimated delivery times shown on the Site or at checkout are indicative only. Actual
        delivery may be affected by traffic, weather, staff availability and other operational
        factors. We do not guarantee delivery within any specific time.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Delayed or Failed Delivery</h2>
      <p>
        If delivery is delayed or we are unable to deliver your order for any reason, the business
        owner reserves the right to cancel the order at any time and refund the full amount paid
        within <strong>5 working days</strong>. No further compensation will be payable.
      </p>

      <h2 className="pt-4 text-2xl text-cream">5. Receiving Your Order</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Please ensure someone is available at the delivery address with a working phone.</li>
        <li>Provide accurate address, landmark and contact details. Incorrect details may lead to cancellation without refund.</li>
        <li>If the delivery person is unable to reach you after reasonable attempts, the order may be cancelled and treated as completed; no refund will apply.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">6. Delivery Charges</h2>
      <p>
        Delivery charges, if any, will be shown clearly at checkout. We may revise charges or
        thresholds for free delivery at any time without prior notice.
      </p>

      <h2 className="pt-4 text-2xl text-cream">7. Risk Transfer</h2>
      <p>
        Risk in the goods passes to you when the products are handed over at the delivery address.
      </p>
    </PolicyPage>
  );
}
