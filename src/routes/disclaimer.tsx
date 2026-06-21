import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — Carwalho's Cafe" },
      { name: "description", content: "Important disclaimers regarding products and information on carwalhoscafe.in." },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <PolicyPage title="Disclaimer">
      <p>
        The information on carwalhoscafe.in is provided in good faith and for general information only.
        We make no warranty of any kind, express or implied, regarding the completeness, accuracy,
        reliability or suitability of the information or products listed.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. No Medical Advice</h2>
      <p>
        Our products — sugarcane juice and tender coconut — are food and beverages, not medicine.
        Statements on the Site are not intended to diagnose, treat, cure or prevent any disease.
        If you have a medical condition, allergy or dietary restriction, please consult a qualified
        professional before consuming our products.
      </p>

      <h2 className="pt-4 text-2xl text-cream">2. Natural Product Variation</h2>
      <p>
        As fresh, natural products, our items may vary in colour, sweetness, volume and appearance.
        Such variation does not constitute a defect.
      </p>

      <h2 className="pt-4 text-2xl text-cream">3. External Links</h2>
      <p>
        The Site may link to external websites. We do not endorse and are not responsible for the
        content, policies or practices of any third-party site.
      </p>

      <h2 className="pt-4 text-2xl text-cream">4. Limitation of Liability</h2>
      <p>
        Under no circumstances will Carwalho&apos;s Cafe, its owners or staff be liable for any loss
        or damage arising from your use of the Site or our products, except as required by applicable law.
      </p>

      <h2 className="pt-4 text-2xl text-cream">5. Use at Your Own Risk</h2>
      <p>Your use of the Site and reliance on any information is strictly at your own risk.</p>
    </PolicyPage>
  );
}
