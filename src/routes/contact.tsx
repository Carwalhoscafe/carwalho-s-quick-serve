import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Phone, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Feedback - Carwalho's Cafe" },
      { name: "description", content: "Reach Carwalho's Cafe for bulk orders, feedback, or to find the shop in Pallavaram, Chennai." },
      { property: "og:title", content: "Contact - Carwalho's Cafe" },
      { property: "og:description", content: "Get in touch with Carwalho's Cafe, Pallavaram." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-16 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Say hello</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">Get in touch.</h1>
        </div>
      </div>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-16 md:grid-cols-3">
        <a href="tel:+919342623521" className="rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-primary/60">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="mt-4 text-lg text-cream">Bulk Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">+91 93426 23521</p>
        </a>
        <a href="mailto:support@carwalhoscafe.in" className="rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-primary/60">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="mt-4 text-lg text-cream">Support</h2>
          <p className="mt-1 text-sm text-muted-foreground">support@carwalhoscafe.in</p>
        </a>
        <div className="rounded-2xl border border-border/70 bg-card/60 p-6">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="mt-4 text-lg text-cream">Visit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Alagappa Nagar, Pallava Garden, Jamin Pallavaram, Chennai – 600117
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
