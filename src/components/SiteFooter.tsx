import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p
            className="text-3xl text-primary"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Carwalho&apos;s Cafe
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
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
      <div className="border-t border-border/60 px-6 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Carwalho&apos;s Cafe · Pallavaram, Chennai
      </div>
    </footer>
  );
}
