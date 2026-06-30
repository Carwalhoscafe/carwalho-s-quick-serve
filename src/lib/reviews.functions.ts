import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type ReviewRow = {
  id: string;
  user_id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
};

export const listReviews = createServerFn({ method: "GET" }).handler(async (): Promise<ReviewRow[]> => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("reviews")
    .select("id,user_id,author_name,rating,body,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("[reviews] list failed", error);
    return [];
  }
  return (data ?? []) as ReviewRow[];
});

const submitSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Please write at least 10 characters").max(600, "Keep it under 600 characters"),
});

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data, context }): Promise<ReviewRow> => {
    const claims = context.claims as Record<string, unknown> | undefined;
    const meta = (claims?.user_metadata ?? {}) as Record<string, unknown>;
    const fallbackEmail = typeof claims?.email === "string" ? claims!.email.split("@")[0] : "Guest";
    const name =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      fallbackEmail;

    const { data: row, error } = await context.supabase
      .from("reviews")
      .insert({
        user_id: context.userId,
        author_name: String(name).slice(0, 80),
        rating: data.rating,
        body: data.body,
      })
      .select("id,user_id,author_name,rating,body,created_at")
      .single();

    if (error) throw new Error(error.message);
    return row as ReviewRow;
  });

export const deleteMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
