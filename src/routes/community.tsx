import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Guidelines - Carwalho's Cafe" },
      { name: "description", content: "Rules for reviews, feedback and community interactions." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <PolicyPage title="Community Guidelines">
      <p>
        These guidelines apply to reviews, ratings, feedback, comments and any other content you
        submit to Carwalho&apos;s Cafe. They exist to keep our community honest, useful and respectful.
      </p>

      <h2 className="pt-4 text-2xl text-cream">1. Be Honest</h2>
      <p>
        Share genuine experiences with our products and service. Reviews must be based on a real
        order placed with us.
      </p>

      <h2 className="pt-4 text-2xl text-cream">2. Be Respectful</h2>
      <p>
        Do not use offensive, abusive, discriminatory, hateful or sexually explicit language.
        Personal attacks against our staff, delivery personnel or other customers are not allowed.
      </p>

      <h2 className="pt-4 text-2xl text-cream">3. No Private Information</h2>
      <p>Do not share phone numbers, addresses, payment details or any other personal information of yourself or others.</p>

      <h2 className="pt-4 text-2xl text-cream">4. No Spam or Promotion</h2>
      <p>Do not post advertisements, promotional content, affiliate links or links to competing businesses.</p>

      <h2 className="pt-4 text-2xl text-cream">5. No Misleading Content</h2>
      <p>Do not post false claims, fake reviews, manipulated photos, or content that misrepresents our products or service.</p>

      <h2 className="pt-4 text-2xl text-cream">6. Licence to Use Your Content</h2>
      <p>
        By submitting reviews, photos or feedback, you grant Carwalho&apos;s Cafe a worldwide,
        royalty-free, perpetual licence to use, display, reproduce and adapt that content for
        marketing and operational purposes, with attribution to your first name where appropriate.
      </p>

      <h2 className="pt-4 text-2xl text-cream">7. Moderation</h2>
      <p>
        We reserve the right to edit, hide, refuse or remove any submitted content at our sole
        discretion, and to suspend or ban any user who violates these guidelines.
      </p>

      <h2 className="pt-4 text-2xl text-cream">8. Reporting</h2>
      <p>
        To report content that violates these guidelines, write to support@carwalhoscafe.in with
        a link or description.
      </p>
    </PolicyPage>
  );
}
