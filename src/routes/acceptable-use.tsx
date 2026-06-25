import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/acceptable-use")({
  head: () => ({
    meta: [
      { title: "Acceptable Use Policy - Carwalho's Cafe" },
      { name: "description", content: "Rules for using carwalhoscafe.in and our services." },
    ],
  }),
  component: AupPage,
});

function AupPage() {
  return (
    <PolicyPage title="Acceptable Use Policy">
      <p>
        This Acceptable Use Policy describes activities that are prohibited on carwalhoscafe.in
        and in your interactions with Carwalho&apos;s Cafe. By using the Site, you agree to comply
        with this policy.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. Prohibited Activities</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Placing fake, fraudulent or speculative orders.</li>
        <li>Using false names, phone numbers or addresses.</li>
        <li>Attempting to gain unauthorised access to any part of the Site, our servers or databases.</li>
        <li>Uploading viruses, malware or any harmful code.</li>
        <li>Scraping, copying or reusing our content, photographs or pricing without written permission.</li>
        <li>Reselling our products without prior written authorisation.</li>
        <li>Harassing, abusing, threatening or defaming our staff, delivery personnel or other customers.</li>
        <li>Using the Site for any unlawful, fraudulent or harmful purpose.</li>
      </ul>

      <h2 className="pt-4 text-2xl text-cream">2. Enforcement</h2>
      <p>
        We may, at our sole discretion and without notice: refuse service, cancel orders, block
        access to the Site, retain any payments collected, and report violations to the appropriate
        legal authorities. We may also recover any losses suffered as a result of your breach.
      </p>

      <h2 className="pt-4 text-2xl text-cream">3. Reporting</h2>
      <p>
        If you become aware of any violation of this policy, please contact us at
        support@carwalhoscafe.in.
      </p>
    </PolicyPage>
  );
}
