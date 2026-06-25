import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/cancellation")({
  head: () => ({
    meta: [
      { title: "Cancellation Policy - Carwalho's Cafe" },
      { name: "description", content: "When and how orders may be cancelled." },
    ],
  }),
  component: CancellationPage,
});

function CancellationPage() {
  return (
    <PolicyPage title="Cancellation Policy">
      <h2 className="pt-2 text-2xl text-cream">1. Cancellation by the Customer</h2>
      <p>
        You may cancel your order free of charge before it is marked as &ldquo;In Preparation&rdquo;.
        Once the order has moved into preparation or has been dispatched, it can no longer be
        cancelled by the customer and the full amount will be charged.
      </p>
      <p>
        To cancel, call +91 93426 23521 immediately or email support@carwalhoscafe.in with your
        order ID.
      </p>

      <h2 className="pt-4 text-2xl text-cream">2. Cancellation by the Business</h2>
      <p>
        The business owner reserves the <strong>absolute right to cancel any order, at any time,
        for any reason</strong>, including but not limited to:
      </p>
      <ul className="list-disc space-y-2 pl-6">
        <li>Unavailability of raw materials.</li>
        <li>Delivery address falling outside our service radius.</li>
        <li>Operational, staffing or vehicle constraints.</li>
        <li>Weather, traffic, force majeure or any condition beyond our control.</li>
        <li>Suspicion of fraud, abuse or misuse of the Site.</li>
        <li>Any other reason at the sole discretion of the business owner.</li>
      </ul>
      <p>
        Where the business cancels a paid order, the full amount will be refunded to the original
        payment method within <strong>5 working days</strong> from the date of cancellation. No
        further compensation or liability shall be due to the customer.
      </p>

      <h2 className="pt-4 text-2xl text-cream">3. Delayed or Failed Delivery</h2>
      <p>
        In the event of delayed delivery, or if we are unable to deliver the product for any reason,
        the order may be cancelled at our discretion and the full amount refunded within 5 working
        days. Carwalho&apos;s Cafe shall not be liable for any indirect or consequential loss arising
        out of a delayed or undelivered order.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Notification</h2>
      <p>
        Cancellations will be communicated to the customer by phone, SMS or email using the contact
        details provided at the time of order.
      </p>
    </PolicyPage>
  );
}
