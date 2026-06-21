import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Carwalho's Cafe" },
      { name: "description", content: "The terms and conditions that govern your use of carwalhoscafe.in and our services." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions">
      <p>
        These Terms govern your use of carwalhoscafe.in and any order you place with Carwalho&apos;s Cafe.
        By using the Site or placing an order, you agree to be bound by these Terms. If you do not agree,
        please do not use the Site.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. Eligibility</h2>
      <p>You must be at least 18 years old and able to enter into a legally binding contract under Indian law.</p>

      <h2 className="pt-4 text-2xl text-cream">2. Orders</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>All orders are subject to acceptance and availability. We may decline or cancel any order at our sole discretion.</li>
        <li>Prices, product descriptions and delivery slots may change without prior notice.</li>
        <li>We deliver only within our published service area (currently a 5 km radius around Pallavaram).</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">3. Pricing & Payment</h2>
      <p>
        Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.
        Payment is collected as per the methods displayed at checkout. We reserve the right to correct
        pricing errors at any time, including after an order is placed.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Product Nature</h2>
      <p>
        Sugarcane juice and tender coconut are fresh, perishable products. Colour, taste, volume and
        appearance may vary slightly between batches. Such natural variation is not a defect.
      </p>

      <h2 className="pt-4 text-2xl text-cream">5. User Conduct</h2>
      <p>
        You agree not to misuse the Site, submit false orders, harass our staff, or attempt to interfere
        with the operation of the Site. We may suspend or block users who violate these Terms.
      </p>

      <h2 className="pt-4 text-2xl text-cream">6. Intellectual Property</h2>
      <p>
        All content on the Site — including the Carwalho&apos;s Cafe name, logo, photographs and text —
        is owned by us and protected by Indian and international intellectual property laws. You may not
        copy, reproduce or use it without our written permission.
      </p>

      <h2 className="pt-4 text-2xl text-cream">7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, our total liability for any claim arising out of an order
        is limited to the amount you paid for that order. We are not liable for any indirect, incidental
        or consequential damages.
      </p>

      <h2 className="pt-4 text-2xl text-cream">8. Indemnity</h2>
      <p>
        You agree to indemnify and hold Carwalho&apos;s Cafe, its owners and staff harmless from any claim
        arising out of your breach of these Terms or misuse of the Site.
      </p>

      <h2 className="pt-4 text-2xl text-cream">9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive
        jurisdiction of the courts at Chennai, Tamil Nadu.
      </p>

      <h2 className="pt-4 text-2xl text-cream">10. Changes</h2>
      <p>
        We may update these Terms at any time. Continued use of the Site after changes are posted
        constitutes acceptance of the revised Terms.
      </p>
    </PolicyPage>
  );
}
