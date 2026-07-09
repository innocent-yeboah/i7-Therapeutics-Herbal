-- Admin system: roles, audit log, service/product visibility, site settings

-- ---------------------------------------------------------------------------
-- Admin roles (future expansion)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_roles (role_name, permissions)
VALUES ('super_admin', '{"all": true}'::jsonb)
ON CONFLICT (role_name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON public.admin_audit_log (admin_id, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_audit_log_select ON public.admin_audit_log;
CREATE POLICY admin_audit_log_select ON public.admin_audit_log
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS admin_audit_log_insert ON public.admin_audit_log;
CREATE POLICY admin_audit_log_insert ON public.admin_audit_log
  FOR INSERT WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Service / product visibility
-- ---------------------------------------------------------------------------
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------------
-- Site settings (key-value store for admin-managed content)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS site_settings_read ON public.site_settings;
CREATE POLICY site_settings_read ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS site_settings_admin ON public.site_settings;
CREATE POLICY site_settings_admin ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (key, value) VALUES
  ('about', '{"headline": "Holistic healing rooted in tradition", "body": "i7 Therapeutics Herbal offers personalized traditional healing therapies, herbal wellness, and restorative care in Accra, Ghana."}'::jsonb),
  ('booking', '{"slotMinutes": 30, "dayStartHour": 9, "dayEndHour": 17}'::jsonb),
  ('notifications', '{"appointmentEmails": true, "orderEmails": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Ensure admin user (update email as needed)
UPDATE public.users SET is_admin = true WHERE email = 'igtechgh@gmail.com';
