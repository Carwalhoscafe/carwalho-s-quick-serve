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
  if (!next) return "/";
  try {
    const u = new URL(next, window.location.origin);
    if (u.origin !== window.location.origin) return "/";
    return u.pathname + u.search;
  } catch {
    return "/";
  }
}

type Mode =
  | "sign-in"       // email + password
  | "sign-up"       // email + password + name → sends OTP
  | "verify-signup" // 6-digit OTP after sign-up
  | "forgot"        // email → sends recovery OTP
  | "verify-reset"; // OTP + new password

function AuthPage() {
  const { next } = useSearch({ from: "/auth" });
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate({ to: safeNext(next) as any });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function switchMode(m: Mode) {
    setMode(m);
    setErr(null);
    setMsg(null);
    setOtp("");
  }

  async function signInGoogle() {
    setErr(null);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) setErr(res.error.message || "Google sign-in failed");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg("We sent a 6-digit code to " + email + ". Enter it below.");
    setMode("verify-signup");
    setCooldown(30);
  }

  async function verifySignupOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
    setBusy(false);
    if (error) setErr(error.message);
    // onAuthStateChange redirects on SIGNED_IN
  }

  async function resendSignupOtp() {
    if (cooldown > 0) return;
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setBusy(false);
    if (error) setErr(error.message);
    else { setMsg("New code sent."); setCooldown(30); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth",
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg("We sent a 6-digit code to " + email + ".");
    setMode("verify-reset");
    setCooldown(30);
  }

  async function verifyResetOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error: verifyErr } = await supabase.auth.verifyOtp({ email, token: otp, type: "recovery" });
    if (verifyErr) { setBusy(false); setErr(verifyErr.message); return; }
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updErr) setErr(updErr.message);
    // onAuthStateChange redirects on SIGNED_IN
  }

  async function resendResetOtp() {
    if (cooldown > 0) return;
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth",
    });
    setBusy(false);
    if (error) setErr(error.message);
    else { setMsg("New code sent."); setCooldown(30); }
  }

  const inputCls = "w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream";
  const primaryBtn = "w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50";
  const secondaryBtn = "w-full rounded-full border border-primary/60 px-5 py-3 text-sm font-semibold text-cream hover:bg-primary/10 disabled:opacity-50";

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-12 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">
            {mode === "sign-up" ? "Create account" : mode === "forgot" || mode === "verify-reset" ? "Reset password" : mode === "verify-signup" ? "Verify email" : "Sign in"}
          </p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">
            {mode === "sign-up" ? "Get started." : mode === "verify-signup" ? "Check your inbox." : mode === "forgot" ? "Forgot it?" : mode === "verify-reset" ? "Set a new password." : "Welcome back."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "verify-signup" || mode === "verify-reset"
              ? "We sent a 6-digit code. Enter it below."
              : "Your cart stays right where it is."}
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-md px-6 py-10">
        <div className="space-y-5 rounded-2xl border border-border/70 bg-card/60 p-6">
          {(mode === "sign-in" || mode === "sign-up") && (
            <>
              <button onClick={signInGoogle} className={primaryBtn}>Continue with Google</button>
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <div className="h-px flex-1 bg-border/60" /> or <div className="h-px flex-1 bg-border/60" />
              </div>
            </>
          )}

          {mode === "sign-in" && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputCls} />
              <button disabled={busy} className={primaryBtn}>{busy ? "Signing in..." : "Sign in"}</button>
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => switchMode("sign-up")} className="text-primary hover:underline">Create account</button>
                <button type="button" onClick={() => switchMode("forgot")} className="text-muted-foreground hover:text-cream">Forgot password?</button>
              </div>
            </form>
          )}

          {mode === "sign-up" && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 characters)" className={inputCls} />
              <button disabled={busy} className={primaryBtn}>{busy ? "Sending code..." : "Send verification code"}</button>
              <button type="button" onClick={() => switchMode("sign-in")} className="w-full text-xs text-muted-foreground hover:text-cream">Already have an account? Sign in</button>
            </form>
          )}

          {mode === "verify-signup" && (
            <form onSubmit={verifySignupOtp} className="space-y-3">
              <p className="text-xs text-muted-foreground">Code sent to <span className="text-cream">{email}</span></p>
              <input inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" className={inputCls + " text-center text-2xl tracking-[0.5em]"} />
              <button disabled={busy || otp.length !== 6} className={primaryBtn}>{busy ? "Verifying..." : "Verify & sign in"}</button>
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => switchMode("sign-up")} className="text-muted-foreground hover:text-cream">← Change email</button>
                <button type="button" disabled={cooldown > 0 || busy} onClick={resendSignupOtp} className="text-primary hover:underline disabled:opacity-50 disabled:no-underline">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-3">
              <p className="text-xs text-muted-foreground">Enter your email and we'll send a 6-digit code.</p>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
              <button disabled={busy} className={primaryBtn}>{busy ? "Sending..." : "Send reset code"}</button>
              <button type="button" onClick={() => switchMode("sign-in")} className="w-full text-xs text-muted-foreground hover:text-cream">← Back to sign in</button>
            </form>
          )}

          {mode === "verify-reset" && (
            <form onSubmit={verifyResetOtp} className="space-y-3">
              <p className="text-xs text-muted-foreground">Code sent to <span className="text-cream">{email}</span></p>
              <input inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" className={inputCls + " text-center text-2xl tracking-[0.5em]"} />
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 8 characters)" className={inputCls} />
              <button disabled={busy || otp.length !== 6} className={primaryBtn}>{busy ? "Updating..." : "Set new password & sign in"}</button>
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => switchMode("sign-in")} className="text-muted-foreground hover:text-cream">← Back to sign in</button>
                <button type="button" disabled={cooldown > 0 || busy} onClick={resendResetOtp} className="text-primary hover:underline disabled:opacity-50 disabled:no-underline">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
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
