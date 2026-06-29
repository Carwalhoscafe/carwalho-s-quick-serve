import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in - Carwalho's Cafe" },
      { name: "description", content: "Sign in to place your sugarcane juice and tender coconut delivery order." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next?: string) {
  if (!next) return "/checkout";
  try {
    const u = new URL(next, window.location.origin);
    if (u.origin !== window.location.origin) return "/checkout";
    return u.pathname + u.search;
  } catch {
    return "/checkout";
  }
}

function AuthPage() {
  const { next } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: safeNext(next) as any });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  // Production origin for email links / OAuth returns — independent of preview host.
  const PROD_ORIGIN = "https://www.carwalhoscafe.in";

  async function signInGoogle() {
    setErr(null);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: PROD_ORIGIN + "/auth",
    });
    if (res.error) setErr(res.error.message || "Google sign-in failed");
  }

  async function sendEmailLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: PROD_ORIGIN + "/auth?next=" + encodeURIComponent(next ?? "/checkout") },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setMsg("Check your inbox for a magic sign-in link.");
  }

  async function sendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) setErr(error.message);
    else { setOtpSent(true); setMsg("OTP sent to your phone."); }
  }

  async function verifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setBusy(false);
    if (error) setErr(error.message);
  }

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Sign in</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to place your order. Your cart stays right where it is.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-md px-6 py-10">
        <div className="space-y-5 rounded-2xl border border-border/70 bg-card/60 p-6">
          <button
            onClick={signInGoogle}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:scale-[1.02] transition-transform"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border/60" /> or <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => { setMode("email"); setOtpSent(false); setMsg(null); setErr(null); }}
              className={`flex-1 rounded-full border px-3 py-2 ${mode === "email" ? "border-primary text-primary" : "border-border/60 text-muted-foreground"}`}
            >Email link</button>
            <button
              onClick={() => { setMode("phone"); setOtpSent(false); setMsg(null); setErr(null); }}
              className={`flex-1 rounded-full border px-3 py-2 ${mode === "phone" ? "border-primary text-primary" : "border-border/60 text-muted-foreground"}`}
            >Phone OTP</button>
          </div>

          {mode === "email" ? (
            <form onSubmit={sendEmailLink} className="space-y-3">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream"
              />
              <button disabled={busy} className="w-full rounded-full border border-primary/60 px-5 py-3 text-sm font-semibold text-cream hover:bg-primary/10 disabled:opacity-50">
                {busy ? "Sending..." : "Send magic link"}
              </button>
            </form>
          ) : !otpSent ? (
            <form onSubmit={sendPhoneOtp} className="space-y-3">
              <input
                type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9xxxxxxxxx"
                className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream"
              />
              <button disabled={busy} className="w-full rounded-full border border-primary/60 px-5 py-3 text-sm font-semibold text-cream hover:bg-primary/10 disabled:opacity-50">
                {busy ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyPhoneOtp} className="space-y-3">
              <input
                inputMode="numeric" required value={otp} onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream tracking-widest"
              />
              <button disabled={busy} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy ? "Verifying..." : "Verify & sign in"}
              </button>
            </form>
          )}

          {msg && <p className="text-xs text-primary">{msg}</p>}
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
