import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Carwalho's Cafe" },
      { name: "description", content: "How carwalhoscafe.in uses cookies and similar technologies." },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <PolicyPage title="Cookie Policy">
      <p>
        This Cookie Policy explains how Carwalho&apos;s Cafe uses cookies and similar technologies
        on carwalhoscafe.in.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. What Are Cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the
        site remember your actions and preferences over a period of time.
      </p>

      <h2 className="pt-4 text-2xl text-cream">2. Cookies We Use</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li><strong>Essential cookies</strong> — required for the cart, checkout and basic site features.</li>
        <li><strong>Preference cookies</strong> — remember your delivery area and recent choices.</li>
        <li><strong>Analytics cookies</strong> — help us understand how visitors use the Site so we can improve it.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">3. Managing Cookies</h2>
      <p>
        You can disable cookies through your browser settings. Please note that disabling essential
        cookies may prevent parts of the Site (including the cart and checkout) from working.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Third Parties</h2>
      <p>
        Some cookies may be set by third-party services we use (such as analytics or payment providers).
        We do not control these cookies; please refer to the respective third-party policies.
      </p>

      <h2 className="pt-4 text-2xl text-cream">5. Updates</h2>
      <p>We may update this policy. The latest version will always be available on this page.</p>
    </PolicyPage>
  );
}
