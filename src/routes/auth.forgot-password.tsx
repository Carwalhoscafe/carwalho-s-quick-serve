import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password - Carwalho's Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPage,
});

const PROD_ORIGIN = "https://www.carwalhoscafe.in";

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: PROD_ORIGIN + "/auth/reset-password",
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen">
      <div className="bg-card/40 pb-10 pt-28">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Password reset</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">Forgot your password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send you a secure reset link.
          </p>
        </div>
      </div>
      <section className="mx-auto max-w-md px-6 py-10">
        <div className="rounded-3xl border border-border/70 bg-card/60 p-7 shadow-xl">
          {sent ? (
            <div className="text-center">
              <h2 className="text-xl text-cream">Check your inbox</h2>
              <p className="mt-2 text-sm text-muted-foreground">If an account exists for {email}, we've sent a reset link. It expires in 1 hour.</p>
              <Link to="/auth" className="mt-6 inline-block text-sm text-primary hover:underline">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
              <button disabled={busy} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy ? "Sending..." : "Send reset link"}
              </button>
              {err && <p className="text-xs text-destructive text-center">{err}</p>}
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
