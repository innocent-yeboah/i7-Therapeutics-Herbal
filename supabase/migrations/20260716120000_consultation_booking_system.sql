-- Consultation-first booking system for i7 Therapeutics Herbal

-- Practitioner role on users
alter table public.users
  add column if not exists is_practitioner boolean not null default false;
alter table public.users
  add column if not exists specialization text;

-- Therapy catalogue (no fixed price/duration — set per consultation recommendation)
create table if not exists public.therapy_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  slug text unique not null,
  category text check (
    category in (
      'massage',
      'cupping',
      'sports',
      'recovery',
      'lymphatic',
      'meridian',
      'deep_tissue',
      'herbal',
      'other'
    )
  ),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists therapy_services_active_idx
  on public.therapy_services (is_active, sort_order);

-- Consultation requests
create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.users (id) on delete set null,

  client_name text not null,
  client_email text not null,
  client_phone text not null,
  preferred_contact text not null
    check (preferred_contact in ('whatsapp', 'call', 'email')),
  preferred_date date,
  preferred_time text,

  condition_description text not null,
  symptoms text,
  duration_of_condition text,
  previous_treatments text,
  current_medications text,
  allergies text,
  desired_outcome text,
  additional_notes text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'reviewed',
        'recommendation_sent',
        'booking_confirmed',
        'completed',
        'cancelled'
      )
    ),

  reviewed_by uuid references public.users (id) on delete set null,
  reviewed_at timestamptz,

  recommended_therapies text[] default '{}',
  recommended_duration text,
  recommended_price numeric(10, 2),
  recommendation_notes text,
  recommendation_sent_at timestamptz,

  confirmed_therapy text,
  confirmed_duration text,
  confirmed_price numeric(10, 2),
  confirmed_date date,
  confirmed_time text,
  booking_confirmed_at timestamptz,

  completed_at timestamptz,
  feedback text,
  rating integer check (rating is null or (rating >= 1 and rating <= 5)),

  admin_notes text
);

create index if not exists consultation_requests_status_idx
  on public.consultation_requests (status, created_at desc);
create index if not exists consultation_requests_email_idx
  on public.consultation_requests (lower(client_email));
create index if not exists consultation_requests_user_idx
  on public.consultation_requests (user_id);

-- Notification preferences (per user)
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade unique,
  email_consultation_requests boolean not null default true,
  email_recommendation_sent boolean not null default true,
  email_booking_confirmed boolean not null default true,
  whatsapp_consultation_requests boolean not null default false,
  whatsapp_recommendation_sent boolean not null default false,
  whatsapp_booking_confirmed boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Seed therapy services
insert into public.therapy_services (name, description, slug, category, sort_order)
values
  ('Hand and Foot Massage', 'Stimulates blood flow, balances nervous system, relieves muscle tension', 'hand-foot-massage', 'massage', 10),
  ('Head, Neck and Shoulder Massage', 'Relieves stress, tension headaches, improves blood flow', 'head-neck-shoulder-massage', 'massage', 20),
  ('Spine and Back Massage', 'Relaxes deep muscle tension, improves posture, enhances mobility', 'spine-back-massage', 'massage', 30),
  ('Dry Cupping Therapy', 'Relieves neck, back, shoulder and knee pain, muscle stiffness', 'dry-cupping', 'cupping', 40),
  ('Wet Cupping Therapy', 'Skin conditions, blood disorders, hypertension, fertility issues', 'wet-cupping', 'cupping', 50),
  ('Sports Injury Management', 'Treat, rehabilitate, and prevent injuries', 'sports-injury', 'sports', 60),
  ('Stroke Recovery Management', 'Improves motor function, reduces spasticity, relieves pain', 'stroke-recovery', 'recovery', 70),
  ('Lymphatic Drainage Massage', 'Stimulates lymph flow, reduces fluid retention, supports immune system', 'lymphatic-drainage', 'lymphatic', 80),
  ('Meridian Massage', 'Addresses digestive issues, emotional imbalance, anxiety', 'meridian-massage', 'meridian', 90),
  ('Deep Tissue / Neuromuscular Therapy', 'Releases chronic muscle tension, targets trigger points', 'deep-tissue', 'deep_tissue', 100),
  ('Herbal Oil Relaxation Massage', 'Reduces stress, eases muscle tension, improves sleep', 'herbal-oil-massage', 'herbal', 110)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Promote existing admins as practitioners by default
update public.users
set is_practitioner = true
where is_admin = true and is_practitioner = false;

-- RLS
alter table public.consultation_requests enable row level security;
alter table public.therapy_services enable row level security;
alter table public.notification_preferences enable row level security;

-- Therapy services: public read of active; admins manage
drop policy if exists "Public can read active therapy services" on public.therapy_services;
create policy "Public can read active therapy services"
  on public.therapy_services for select
  using (is_active = true or exists (
    select 1 from public.users u
    where u.id = auth.uid() and (u.is_admin = true or u.is_practitioner = true)
  ));

drop policy if exists "Admins manage therapy services" on public.therapy_services;
create policy "Admins manage therapy services"
  on public.therapy_services for all
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and (u.is_admin = true or u.is_practitioner = true)
  ))
  with check (exists (
    select 1 from public.users u
    where u.id = auth.uid() and (u.is_admin = true or u.is_practitioner = true)
  ));

-- Consultation requests: anyone can insert (guest booking)
drop policy if exists "Anyone can insert consultation requests" on public.consultation_requests;
create policy "Anyone can insert consultation requests"
  on public.consultation_requests for insert
  with check (true);

drop policy if exists "Admins can view all consultation requests" on public.consultation_requests;
create policy "Admins can view all consultation requests"
  on public.consultation_requests for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and (u.is_admin = true or u.is_practitioner = true)
  ));

drop policy if exists "Users can view their own consultation requests" on public.consultation_requests;
create policy "Users can view their own consultation requests"
  on public.consultation_requests for select
  using (
    (auth.uid() is not null and user_id = auth.uid())
    or (
      auth.uid() is not null
      and lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "Admins can update consultation requests" on public.consultation_requests;
create policy "Admins can update consultation requests"
  on public.consultation_requests for update
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and (u.is_admin = true or u.is_practitioner = true)
  ))
  with check (exists (
    select 1 from public.users u
    where u.id = auth.uid() and (u.is_admin = true or u.is_practitioner = true)
  ));

-- Clients can confirm their own recommendation (update limited fields via app using service role or this policy)
drop policy if exists "Clients can confirm own consultations" on public.consultation_requests;
create policy "Clients can confirm own consultations"
  on public.consultation_requests for update
  using (
    (auth.uid() is not null and user_id = auth.uid())
    or (
      auth.uid() is not null
      and lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or (
      auth.uid() is not null
      and lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Notification preferences
drop policy if exists "Users manage own notification preferences" on public.notification_preferences;
create policy "Users manage own notification preferences"
  on public.notification_preferences for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Admins read notification preferences" on public.notification_preferences;
create policy "Admins read notification preferences"
  on public.notification_preferences for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

grant select on public.therapy_services to anon, authenticated;
grant insert on public.consultation_requests to anon, authenticated;
grant select, update on public.consultation_requests to authenticated;
grant all on public.notification_preferences to authenticated;
