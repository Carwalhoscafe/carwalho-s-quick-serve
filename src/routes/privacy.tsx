import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Carwalho's Cafe" },
      { name: "description", content: "How Carwalho's Cafe collects, uses and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        Carwalho&apos;s Cafe (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy.
        This policy explains what we collect when you use carwalhoscafe.in (the &ldquo;Site&rdquo;) and place
        an order with us, and how we use that information.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. Information We Collect</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Name, phone number, delivery address and email when you place an order.</li>
        <li>Order details, cart contents and payment method selected.</li>
        <li>Feedback, reviews and messages you choose to send us.</li>
        <li>Technical data such as IP address, browser type and pages visited (via cookies and analytics).</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">2. How We Use It</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>To accept, prepare and deliver your orders.</li>
        <li>To contact you about your order, delivery status or refunds.</li>
        <li>To improve our menu, website and service quality.</li>
        <li>To comply with applicable Indian law, including tax and consumer protection requirements.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">3. Sharing</h2>
      <p>
        We do not sell your personal data. We share it only with delivery staff, payment processors,
        hosting providers and government authorities where legally required.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Retention</h2>
      <p>
        We retain order records for as long as required under Indian tax and accounting law. You may
        request deletion of marketing data at any time by writing to support@carwalhoscafe.in.
      </p>

      <h2 className="pt-4 text-2xl text-cream">5. Security</h2>
      <p>
        We apply reasonable technical and organisational measures to protect your data. However, no
        method of transmission over the Internet is fully secure and we cannot guarantee absolute security.
      </p>

      <h2 className="pt-4 text-2xl text-cream">6. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by emailing
        support@carwalhoscafe.in. We will respond within a reasonable time as required by law.
      </p>

      <h2 className="pt-4 text-2xl text-cream">7. Updates</h2>
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top reflects
        the latest revision. Continued use of the Site means you accept the updated policy.
      </p>

      <h2 className="pt-4 text-2xl text-cream">8. Contact</h2>
      <p>
        Carwalho&apos;s Cafe, Alagappa Nagar, Pallava Garden, Jamin Pallavaram, Chennai 600117.
        Email: support@carwalhoscafe.in · Phone: +91 93426 23521.
      </p>
    </PolicyPage>
  );
}
