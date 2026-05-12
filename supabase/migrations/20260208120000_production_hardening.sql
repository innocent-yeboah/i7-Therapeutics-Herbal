-- Production hardening: run in Supabase SQL Editor (after existing schema.sql) or via CLI migrate.
-- Atomic order fulfillment, contacts backup, webhook failure log, contact rate limiting.

-- ---------------------------------------------------------------------------
-- Atomic stock decrement + mark order paid (single transaction)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fulfill_order_atomic(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_updated int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id AND status IN ('paid', 'processing', 'shipped', 'delivered')
  ) THEN
    RETURN json_build_object('ok', true, 'already_fulfilled', true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.orders WHERE id = p_order_id AND status = 'pending'
  ) THEN
    RETURN json_build_object('ok', false, 'error', 'order_not_pending');
  END IF;

  FOR r IN
    SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    UPDATE public.products
    SET stock_quantity = stock_quantity - r.quantity
    WHERE id = r.product_id AND stock_quantity >= r.quantity;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated = 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK_FOR_PRODUCT:%', r.product_id;
    END IF;
  END LOOP;

  UPDATE public.orders SET status = 'paid' WHERE id = p_order_id AND status = 'pending';

  RETURN json_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_order_atomic(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fulfill_order_atomic(uuid) TO service_role;

-- ---------------------------------------------------------------------------
-- Inbound contact messages (backup when email provider fails / missing)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'emailed', 'email_failed')),
  email_error text
);

CREATE INDEX IF NOT EXISTS idx_contacts_status_created ON public.contacts (status, created_at DESC);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contacts_admin_select ON public.contacts;
CREATE POLICY contacts_admin_select ON public.contacts
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS contacts_admin_update ON public.contacts;
CREATE POLICY contacts_admin_update ON public.contacts
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Inserts only via service_role (API route); no public insert policy

-- ---------------------------------------------------------------------------
-- Paystack webhook failures (manual retry from admin)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  provider text NOT NULL DEFAULT 'paystack',
  event_type text,
  reference text,
  payload jsonb,
  error_message text,
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_webhook_failures_unresolved ON public.webhook_failures (created_at DESC)
  WHERE resolved_at IS NULL;

ALTER TABLE public.webhook_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS webhook_failures_admin_all ON public.webhook_failures;
CREATE POLICY webhook_failures_admin_all ON public.webhook_failures
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Contact API rate limit (per IP, rolling UTC hour)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  ip_hash text NOT NULL,
  hour_bucket timestamptz NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, hour_bucket)
);

ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies: only service_role touches this table

CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(p_ip_hash text, p_max int DEFAULT 5)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bucket timestamptz := date_trunc('hour', (now() AT TIME ZONE 'utc'));
  new_count int;
BEGIN
  INSERT INTO public.contact_rate_limits (ip_hash, hour_bucket, count)
  VALUES (p_ip_hash, bucket, 1)
  ON CONFLICT (ip_hash, hour_bucket)
  DO UPDATE SET count = public.contact_rate_limits.count + 1
  RETURNING count INTO new_count;

  RETURN new_count <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.check_contact_rate_limit(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_contact_rate_limit(text, int) TO service_role;
