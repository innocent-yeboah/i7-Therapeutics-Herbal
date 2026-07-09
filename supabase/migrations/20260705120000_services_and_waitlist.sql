-- Add slug to services, waitlist table, and seed new healing therapies.

-- ---------------------------------------------------------------------------
-- Services: slug column for URL routing and booking integration
-- ---------------------------------------------------------------------------
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'services_slug_unique'
  ) THEN
    ALTER TABLE public.services ADD CONSTRAINT services_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Waitlist for coming-soon offerings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  offering_slug text NOT NULL,
  offering_name text NOT NULL DEFAULT '',
  UNIQUE (email, offering_slug)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_offering ON public.waitlist_subscribers (offering_slug, created_at DESC);

ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS waitlist_admin_select ON public.waitlist_subscribers;
CREATE POLICY waitlist_admin_select ON public.waitlist_subscribers
  FOR SELECT USING (public.is_admin());

-- Inserts only via service_role (API route)

-- ---------------------------------------------------------------------------
-- Seed / update the 10 traditional healing therapy services
-- ---------------------------------------------------------------------------
INSERT INTO public.services (slug, name, description, price, duration_minutes, image)
VALUES
  (
    'hand-foot-massage',
    'Hand and Foot Massage',
    'Stimulates blood flow, balances the nervous system, relieves muscle tension, and promotes deep relaxation.',
    120, 45,
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'head-neck-shoulder-massage',
    'Head, Neck & Shoulder Massage',
    'Relieves physical and mental stress, reduces anxiety and tension headaches, and promotes sleep quality.',
    130, 45,
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'spine-back-massage',
    'Spine and Back Massage',
    'Relaxes deep muscle tension, improves posture, and enhances mobility and flexibility.',
    180, 60,
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'cupping-therapy',
    'Cupping Therapy',
    'Dry and wet cupping for pain relief, muscle stiffness, sports recovery, and holistic wellness.',
    200, 60,
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'sports-injury-management',
    'Sports Injury Management',
    'Targeted soft-tissue therapy to treat, rehabilitate, and prevent sports injuries.',
    220, 60,
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'stroke-recovery-management',
    'Stroke Recovery Management',
    'Complementary therapy to improve motor function, reduce spasticity, and boost circulation.',
    200, 60,
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'lymphatic-drainage-massage',
    'Lymphatic Drainage Massage',
    'Gentle rhythmic strokes to stimulate lymph flow, reduce fluid retention, and support immunity.',
    190, 60,
    'https://images.unsplash.com/photo-1515377901643-3387c1c0c0e0?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'meridian-massage',
    'Meridian Massage',
    'Holistic bodywork addressing physical, mental, and emotional balance through qi flow restoration.',
    210, 75,
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'advanced-deep-tissue-nmt',
    'Advanced Deep Tissue / Neuromuscular Therapy (NMT)',
    'Specialized technique releasing chronic muscle tension, trigger points, and fascial restrictions.',
    240, 75,
    'https://images.unsplash.com/photo-1599901860904-17e06ed70856?w=900&q=80&auto=format&fit=crop'
  ),
  (
    'herbal-oil-relaxation-massage',
    'Herbal Oil Relaxation Massage',
    'Aromatherapy-infused massage with gentle flowing strokes to calm the nervous system.',
    170, 60,
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=900&q=80&auto=format&fit=crop'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration_minutes = EXCLUDED.duration_minutes,
  image = EXCLUDED.image;
