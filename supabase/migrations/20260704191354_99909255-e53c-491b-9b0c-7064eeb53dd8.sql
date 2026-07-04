
-- 1. Revoke public execute on SECURITY DEFINER functions; grant only where needed
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- has_role is needed by RLS policies as authenticated user
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Email helpers only for service_role
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;

-- 2. Fix mutable search_path on functions missing SET search_path
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pgmq
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

-- 3. Add INSERT policy on orders so signed-in users can create their own orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
CREATE POLICY "Users can insert their own order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- 4. Storage policies for private 'carwalhoscafe' bucket, scoped to owner
DROP POLICY IF EXISTS "Users can view own carwalhoscafe files" ON storage.objects;
CREATE POLICY "Users can view own carwalhoscafe files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'carwalhoscafe' AND owner = auth.uid());

DROP POLICY IF EXISTS "Users can upload own carwalhoscafe files" ON storage.objects;
CREATE POLICY "Users can upload own carwalhoscafe files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'carwalhoscafe' AND owner = auth.uid());

DROP POLICY IF EXISTS "Users can update own carwalhoscafe files" ON storage.objects;
CREATE POLICY "Users can update own carwalhoscafe files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'carwalhoscafe' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'carwalhoscafe' AND owner = auth.uid());

DROP POLICY IF EXISTS "Users can delete own carwalhoscafe files" ON storage.objects;
CREATE POLICY "Users can delete own carwalhoscafe files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'carwalhoscafe' AND owner = auth.uid());
