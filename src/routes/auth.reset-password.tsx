import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password - Carwalho's Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPage,
});

function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH = ["Too short", "Weak", "Fair", "Medium", "Strong", "Very Strong"];
const STRENGTH_COLOR = ["bg-red-500", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [noSession, setNoSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const score = useMemo(() => passwordScore(password), [password]);
  const mismatch = confirm.length > 0 && confirm !== password;
  const validPw = score >= 4 && password.length >= 8;

  useEffect(() => {
    // Supabase exchanges the recovery code automatically from URL when detectSessionInUrl is default.
    // Give it a moment then check session.
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { setNoSession(true); setReady(true); return; }
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname);
      }
      const { data } = await supabase.auth.getSession();
      setNoSession(!data.session);
      setReady(true);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validPw || mismatch) return;
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setErr(error.message);
    else {
      // Revoke other sessions
      try { await supabase.auth.signOut({ scope: "others" }); } catch {}
      setDone(true);
      setTimeout(() => navigate({ to: "/" as any }), 1500);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-card/40 pb-10 pt-28">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Reset password</p>
          <h1 className="mt-3 text-4xl text-cream md:text-5xl">Set a new password.</h1>
        </div>
      </div>
      <section className="mx-auto max-w-md px-6 py-10">
        <div className="rounded-3xl border border-border/70 bg-card/60 p-7 shadow-xl">
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center">Verifying link...</p>
          ) : noSession ? (
            <div className="text-center">
              <p className="text-sm text-destructive">This reset link is invalid or has expired.</p>
              <Link to={"/auth/forgot-password" as any} className="mt-4 inline-block text-sm text-primary hover:underline">Request a new link</Link>
            </div>
          ) : done ? (
            <p className="text-center text-sm text-cream">Password updated. Redirecting...</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <input required type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border border-border/70 bg-background pl-4 pr-10 py-3 text-sm text-cream" />
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
              <input required type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream" />
              {mismatch && <p className="text-[11px] text-destructive">Passwords do not match.</p>}
              <button disabled={busy || !validPw || mismatch} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy ? "Updating..." : "Update password"}
              </button>
              {err && <p className="text-xs text-destructive text-center">{err}</p>}
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
