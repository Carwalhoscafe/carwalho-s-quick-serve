import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight } from "lucide-react";

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
      { name: "description", content: "Sign in to your Carwalho's Cafe account to order fresh sugarcane juice and tender coconut delivery." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

const PROD_ORIGIN = "https://www.carwalhoscafe.in";

function safeNext(next?: string) {
  if (!next) return "/";
  try {
    const u = new URL(next, window.location.origin);
    if (u.origin !== window.location.origin) return "/";
    return u.pathname + u.search;
  } catch { return "/"; }
}

function AuthPage() {
  const { next } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"password" | "phone">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [remember, setRemember] = useState(true);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: safeNext(next) as any });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  async function signInGoogle() {
    setErr(null);
    const nextParam = next ? "?next=" + encodeURIComponent(next) : "";
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: PROD_ORIGIN + "/auth/callback" + nextParam,
    });
    if (res.error) setErr(res.error.message || "Google sign-in failed");
  }

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        setErr("Please verify your email first. Check your inbox for the confirmation link.");
      } else if (/invalid login credentials/i.test(error.message)) {
        setErr("Wrong email or password. If you signed up with a code before, use 'Forgot password' to set one.");
      } else {
        setErr(error.message);
      }
    }
  }

  async function sendPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) setErr(error.message);
    else setOtpSent(true);
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
      <div className="relative bg-card/40 pb-10 pt-28">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Sign in</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Carwalho's Cafe account.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-md px-6 py-10">
        <div className="space-y-5 rounded-3xl border border-border/70 bg-card/60 p-7 shadow-xl">
          <button
            onClick={signInGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-cream hover:bg-background/70 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41.4 35 44 30 44 24c0-1.3-.1-2.5-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border/60" /> or <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => { setMode("password"); setErr(null); }}
              className={`flex-1 rounded-full border px-3 py-2 transition ${mode === "password" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}
            >Email & password</button>
            <button
              onClick={() => { setMode("phone"); setErr(null); setOtpSent(false); }}
              className={`flex-1 rounded-full border px-3 py-2 transition ${mode === "phone" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"}`}
            >Phone OTP</button>
          </div>

          {mode === "password" ? (
            <form onSubmit={signInPassword} className="space-y-3">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" required autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-lg border border-border/70 bg-background pl-9 pr-4 py-3 text-sm text-cream"
                />
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"} required autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                  placeholder="Password"
                  className="w-full rounded-lg border border-border/70 bg-background pl-9 pr-10 py-3 text-sm text-cream"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-cream">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsOn && <p className="text-[11px] text-amber-400">Caps Lock is on</p>}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
                  Remember me
                </label>
                <Link to={"/auth/forgot-password" as any} className="text-primary hover:underline">Forgot password?</Link>
              </div>

              <button disabled={busy} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:scale-[1.01] transition-transform inline-flex items-center justify-center gap-2">
                {busy ? "Signing in..." : (<>Sign In <ArrowRight className="h-4 w-4" /></>)}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to={"/auth/signup" as any}
                  search={next ? ({ next } as any) : undefined}
                  className="text-primary hover:underline font-semibold"
                >Create account</Link>
              </p>
            </form>
          ) : !otpSent ? (
            <form onSubmit={sendPhoneOtp} className="space-y-3">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9xxxxxxxxx"
                  className="w-full rounded-lg border border-border/70 bg-background pl-9 pr-4 py-3 text-sm text-cream"
                />
              </div>
              <button disabled={busy} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyPhoneOtp} className="space-y-3">
              <input
                inputMode="numeric" required value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code" maxLength={6}
                className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-center text-lg tracking-[0.6em] text-cream"
              />
              <button disabled={busy || otp.length !== 6} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy ? "Verifying..." : "Verify & sign in"}
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="w-full text-xs text-muted-foreground hover:text-cream">Change phone</button>
            </form>
          )}

          {err && <p className="text-xs text-destructive text-center">{err}</p>}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
