import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Return Policy — Carwalho's Cafe" },
      { name: "description", content: "Our return policy for fresh, perishable beverages." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <PolicyPage title="Return Policy">
      <p>
        Because Carwalho&apos;s Cafe sells fresh, perishable food and beverages, returns are
        <strong> not accepted</strong> once a product has been delivered and accepted by you. This
        is to protect the health and safety of all our customers.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. When Returns May Be Considered</h2>
      <p>
        We will consider replacement or refund (at our discretion) only in the following cases, and
        only if reported within <strong>30 minutes of delivery</strong> with clear photo evidence:
      </p>
      <ul className="list-disc space-y-2 pl-6">
        <li>The item is visibly spoilt, contaminated or leaking on arrival.</li>
        <li>The wrong item was delivered.</li>
        <li>The packaging was tampered with before delivery.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">2. What Is Not Returnable</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Any product that has been partially or fully consumed.</li>
        <li>Products with natural variations in taste, colour, volume or appearance.</li>
        <li>Orders where the complaint is raised after the time limit above.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">3. Process</h2>
      <p>
        Email support@carwalhoscafe.in with your order ID, photographs and a short description.
        Our team will review and respond within 2 working days. Approved cases will be handled as
        per our Refund Policy.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Final Decision</h2>
      <p>All return decisions rest solely with Carwalho&apos;s Cafe and are final.</p>
    </PolicyPage>
  );
}
