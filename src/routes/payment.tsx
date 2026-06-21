import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment Policy — Carwalho's Cafe" },
      { name: "description", content: "Accepted payment methods, billing and currency information." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  return (
    <PolicyPage title="Payment Policy">
      <h2 className="pt-2 text-2xl text-cream">1. Accepted Methods</h2>
      <p>
        We currently accept Cash on Delivery (COD) and other payment methods displayed at checkout.
        Available methods may change at any time without notice.
      </p>

      <h2 className="pt-4 text-2xl text-cream">2. Currency</h2>
      <p>All transactions are processed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</p>

      <h2 className="pt-4 text-2xl text-cream">3. Order Confirmation</h2>
      <p>
        Acceptance of an order is confirmed only after payment authorisation (for prepaid orders) or
        after explicit confirmation by our team (for COD orders). We may refuse or cancel any order
        prior to confirmation.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Pricing Errors</h2>
      <p>
        Despite our best efforts, prices on the Site may occasionally contain errors. We reserve the
        right to cancel any order placed at an incorrect price and to refund any amount paid.
      </p>

      <h2 className="pt-4 text-2xl text-cream">5. Failed or Reversed Payments</h2>
      <p>
        If a payment fails, is reversed, charged back or disputed, we may suspend the order and
        recover any losses by lawful means. Repeated chargeback abuse may lead to a permanent ban.
      </p>

      <h2 className="pt-4 text-2xl text-cream">6. Refunds</h2>
      <p>
        Refunds, where applicable, are processed as per our <a className="text-primary hover:underline" href="/refund">Refund Policy</a>
        and are credited to the original payment method within 5 working days.
      </p>

      <h2 className="pt-4 text-2xl text-cream">7. Third-Party Processors</h2>
      <p>
        Online payments are handled by third-party payment gateways. We do not store full card or
        UPI details on our servers and are not responsible for the practices of third-party processors,
        except as required by law.
      </p>

      <h2 className="pt-4 text-2xl text-cream">8. Invoices</h2>
      <p>
        Invoices are issued in the name and address provided at the time of order. It is your
        responsibility to provide correct billing details.
      </p>
    </PolicyPage>
  );
}
