import { Link } from "@tanstack/react-router";
import logoWhite from "@/assets/carwalhos-logo-white.png.asset.json";

const policyLinks: Array<{ to: string; label: string }> = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/refund", label: "Refund Policy" },
  { to: "/returns", label: "Return Policy" },
  { to: "/cancellation", label: "Cancellation Policy" },
  { to: "/shipping", label: "Shipping & Delivery" },
  { to: "/payment", label: "Payment Policy" },
  { to: "/acceptable-use", label: "Acceptable Use" },
  { to: "/community", label: "Community Guidelines" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <img
            src={logoWhite.url}
            alt="Carwalho's Cafe"
            width={200}
            height={60}
            className="h-10 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Fresh sugarcane juice & tender coconut, hand-pressed daily and
            delivered to your door across Pallavaram.
          </p>
        </div>

        <div className="text-sm">
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary">
            Visit Us
          </h4>
          <p className="mt-3 text-cream/80">
            Alagappa Nagar, Pallava Garden,<br />
            Jamin Pallavaram,<br />
            Chennai – 600117
          </p>
          <p className="mt-3 text-muted-foreground">
            Mon – Fri · 10:00 AM – 2:00 PM<br />
            5 km delivery radius
          </p>
        </div>

        <div className="text-sm">
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary">
            Get in Touch
          </h4>
          <ul className="mt-3 space-y-2 text-cream/80">
            <li>
              <a href="tel:+919342623521" className="hover:text-primary">
                +91 93426 23521
              </a>
              <span className="ml-2 text-muted-foreground">(bulk orders)</span>
            </li>
            <li>
              <a
                href="mailto:support@carwalhoscafe.in"
                className="hover:text-primary"
              >
                support@carwalhoscafe.in
              </a>
            </li>
            <li className="flex gap-4 pt-2 text-muted-foreground">
              <Link to="/menu" className="hover:text-primary">Menu</Link>
              <Link to="/about" className="hover:text-primary">Our Story</Link>
              <Link to="/contact" className="hover:text-primary">Feedback</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h4 className="text-xs uppercase tracking-[0.25em] text-primary">
            Policies
          </h4>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {policyLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 px-6 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Carwalho&apos;s Cafe · Pallavaram, Chennai
      </div>
    </footer>
  );
}
