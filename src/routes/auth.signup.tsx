import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth/signup")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Create your account - Carwalho's Cafe" },
      { name: "description", content: "Create your Carwalho's Cafe account for fast delivery, order history, and rewards." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignupPage,
});

const PROD_ORIGIN = "https://www.carwalhoscafe.in";

function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-5
}
const STRENGTH = ["Too short", "Weak", "Fair", "Medium", "Strong", "Very Strong"];
const STRENGTH_COLOR = ["bg-red-500", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

function SignupPage() {
  const { next } = useSearch({ from: "/auth/signup" });
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const score = useMemo(() => passwordScore(password), [password]);
  const mismatch = confirm.length > 0 && confirm !== password;
  const validPw = score >= 4 && password.length >= 8;
  const canSubmit = first && last && email && phone && validPw && !mismatch && terms && !busy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true); setErr(null);
    const nextParam = next ? "?next=" + encodeURIComponent(next) : "";
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: PROD_ORIGIN + "/auth/callback" + nextParam,
        data: { first_name: first.trim(), last_name: last.trim(), phone: phone.trim() },
      },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <div className="bg-card/40 pb-10 pt-28"><SiteHeader /></div>
        <section className="mx-auto max-w-md px-6 py-16 text-center">
          <div className="rounded-3xl border border-border/70 bg-card/60 p-8">
            <h1 className="text-3xl text-cream">Check your inbox</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a confirmation link to <span className="text-cream">{email}</span>. Click it to activate your account.
            </p>
            <Link to="/auth" className="mt-6 inline-block text-sm text-primary hover:underline">Back to sign in</Link>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-card/40 pb-10 pt-28">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Create account</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">Join Carwalho's Cafe.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Fresh drinks, faster checkout, order history.</p>
        </div>
      </div>

      <section className="mx-auto max-w-lg px-6 py-10">
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border/70 bg-card/60 p-7 shadow-xl">
          <div className="grid grid-cols-2 gap-3">
            <input required value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
            <input required value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className="rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
          </div>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
          <input required type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9xxxxxxxxx" className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />

          <div className="relative">
            <input required type={showPw ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-border/70 bg-background pl-4 pr-10 py-3 text-sm text-cream" />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-cream">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password && (
            <div>
              <div className="flex gap-1">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded ${i < score ? STRENGTH_COLOR[score] : "bg-border/50"}`} />
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{STRENGTH[score]} · 8+ chars, upper, lower, number, symbol</p>
            </div>
          )}

          <input required type={showPw ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
          {mismatch && <p className="text-[11px] text-destructive">Passwords do not match.</p>}

          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 accent-primary" />
            <span>I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</span>
          </label>

          <button disabled={!canSubmit} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:scale-[1.01] transition-transform">
            {busy ? "Creating account..." : "Create Account"}
          </button>

          {err && <p className="text-xs text-destructive text-center">{err}</p>}

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </form>
      </section>

      <SiteFooter />
    </div>
  );
}
