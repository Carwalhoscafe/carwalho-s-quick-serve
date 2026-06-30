CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 600),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews"
  ON public.reviews FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Authenticated users can post their own review"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users can delete their own review"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_reviews_updated_at();

CREATE INDEX reviews_created_at_idx ON public.reviews (created_at DESC);