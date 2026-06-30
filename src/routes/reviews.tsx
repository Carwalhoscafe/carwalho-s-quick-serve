import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StarPicker, StarRating } from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteMyReview,
  listReviews,
  submitReview,
  type ReviewRow,
} from "@/lib/reviews.functions";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews - Carwalho's Cafe" },
      { name: "description", content: "Real reviews from Pallavaram regulars enjoying Carwalho's Cafe sugarcane juice and tender coconut." },
      { property: "og:title", content: "Reviews - Carwalho's Cafe" },
      { property: "og:description", content: "Real reviews from real Pallavaram regulars." },
    ],
  }),
  component: ReviewsPage,
});

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ReviewsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listReviews);
  const submit = useServerFn(submitReview);
  const remove = useServerFn(deleteMyReview);

  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserId(s?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const reviewsQ = useQuery({
    queryKey: ["reviews"],
    queryFn: () => list(),
  });

  const reviews: ReviewRow[] = reviewsQ.data ?? [];
  const count = reviews.length;
  const avg = count ? reviews.reduce((a, r) => a + r.rating, 0) / count : 0;
  const myReview = userId ? reviews.find((r) => r.user_id === userId) : undefined;

  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  const submitMut = useMutation({
    mutationFn: (payload: { rating: number; body: string }) => submit({ data: payload }),
    onSuccess: (row) => {
      toast.success("Thanks for your review!");
      setBody("");
      setRating(5);
      qc.setQueryData<ReviewRow[]>(["reviews"], (prev) => [row, ...(prev ?? []).filter((r) => r.id !== row.id)]);
    },
    onError: (e: Error) => toast.error(e.message || "Could not submit review"),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: (_r, id) => {
      qc.setQueryData<ReviewRow[]>(["reviews"], (prev) => (prev ?? []).filter((r) => r.id !== id));
      toast.success("Review deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen">
      <div className="relative bg-card/40 pb-16 pt-32">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Reviews</p>
          <h1 className="mt-3 text-5xl text-cream md:text-6xl">Loved by our regulars.</h1>
          <p className="mt-4 text-muted-foreground">
            Real notes from customers who order their sugarcane juice and tender coconut from us in Pallavaram.
          </p>

          {count > 0 && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/60 px-4 py-2">
              <StarRating value={Math.round(avg)} />
              <span className="text-sm text-cream">{avg.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">· {count} review{count === 1 ? "" : "s"}</span>
            </div>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-12">
        {/* Write a review */}
        <div className="rounded-2xl border border-border/70 bg-card/60 p-6">
          {!authReady ? (
            <div className="h-24 animate-pulse rounded-lg bg-muted/30" />
          ) : userId ? (
            myReview ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Your review</p>
                <div className="flex items-center justify-between">
                  <StarRating value={myReview.rating} />
                  <button
                    onClick={() => removeMut.mutate(myReview.id)}
                    disabled={removeMut.isPending}
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-cream/90">{myReview.body}</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (body.trim().length < 10) return toast.error("Please write at least 10 characters");
                  submitMut.mutate({ rating, body: body.trim() });
                }}
                className="space-y-4"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-primary">Share your experience</p>
                  <h2 className="mt-2 text-2xl text-cream">Leave a review</h2>
                </div>
                <div className="flex items-center gap-3">
                  <StarPicker value={rating} onChange={setRating} />
                  <span className="text-xs text-muted-foreground">{rating}/5</span>
                </div>
                <div>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, 600))}
                    placeholder="How was your sugarcane juice or tender coconut?"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border/70 bg-background px-4 py-3 text-sm text-cream placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Min 10 characters</span>
                    <span>{body.length}/600</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitMut.isPending}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {submitMut.isPending ? "Posting..." : "Post review"}
                </button>
              </form>
            )
          ) : (
            <div className="flex flex-col items-start gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Have an opinion?</p>
                <h2 className="mt-2 text-2xl text-cream">Sign in to leave a review</h2>
                <p className="mt-1 text-sm text-muted-foreground">Only verified customers can post here.</p>
              </div>
              <Link
                to="/auth"
                search={{ next: "/reviews" }}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:scale-[1.02] transition-transform"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Reviews list */}
        <div className="mt-10">
          {reviewsQ.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/20" />
              ))}
            </div>
          ) : count === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No reviews yet. Be the first to share.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-border/60 bg-card/40 p-5"
                >
                  <header className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {r.author_name.trim().charAt(0).toUpperCase() || "G"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-cream">{r.author_name}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</p>
                    </div>
                    <StarRating value={r.rating} />
                  </header>
                  <p className="mt-3 text-sm leading-relaxed text-cream/85">{r.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
