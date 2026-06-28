ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_lat numeric,
  ADD COLUMN IF NOT EXISTS delivery_lng numeric,
  ADD COLUMN IF NOT EXISTS delivery_distance_km numeric;