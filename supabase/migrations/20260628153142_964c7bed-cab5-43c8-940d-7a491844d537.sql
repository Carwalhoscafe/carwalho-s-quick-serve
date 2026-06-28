-- Role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- has_role security-definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- Extend orders RLS for admins
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Extend order_items RLS for admins
DROP POLICY IF EXISTS "Admins view all order items" ON public.order_items;
CREATE POLICY "Admins view all order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed admin role for lawrance if user exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'lawrance@carwalhoscafe.in'
ON CONFLICT (user_id, role) DO NOTHING;