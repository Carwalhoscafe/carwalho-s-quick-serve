import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Fire-and-forget: called from the client once per session on SIGNED_IN.
 * Upserts a row into the `Users` tab in Google Sheets for owner-side tracking.
 */
export const logUserSignIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { userId, claims } = context;
      const email = (claims?.email as string | undefined) ?? null;
      const name =
        (claims?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
        (claims?.user_metadata as { name?: string } | undefined)?.name ??
        null;
      const provider =
        (claims?.app_metadata as { provider?: string } | undefined)?.provider ?? null;

      const { upsertUserRow } = await import("./integrations.server");
      await upsertUserRow({
        userId,
        email,
        name,
        provider,
        nowIso: new Date().toISOString(),
      });
      return { ok: true };
    } catch (e) {
      console.error("[users] logUserSignIn failed", e);
      return { ok: false };
    }
  });
