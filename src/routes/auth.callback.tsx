import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ next: z.string().optional(), code: z.string().optional() });

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Signing you in..." }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CallbackPage,
});

function safeNext(next?: string) {
  if (!next) return "/";
  try {
    const u = new URL(next, window.location.origin);
    if (u.origin !== window.location.origin) return "/";
    return u.pathname + u.search;
  } catch { return "/"; }
}

function CallbackPage() {
  const { next, code } = useSearch({ from: "/auth/callback" });
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate({ to: safeNext(next) as any, replace: true });
        } else {
          navigate({ to: "/auth" as any, replace: true });
        }
      } catch (e: any) {
        setErr(e?.message || "Sign-in failed");
      }
    })();
  }, [code, navigate, next]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {err ? (
          <>
            <p className="text-destructive">{err}</p>
            <a href="/auth" className="mt-4 inline-block text-sm text-primary hover:underline">Back to sign in</a>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        )}
      </div>
    </div>
  );
}
