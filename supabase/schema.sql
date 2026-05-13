-- i7 Therapeutics Herbal — run in Supabase SQL Editor (or migrate)
-- Enable extensions
create extension if not exists "uuid-ossp";

-- Profiles / clients (linked to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12, 2) not null default 0,
  duration_minutes int not null default 60,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid   primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  appointment_date date not null,
  appointment_time text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text default '',
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (appointment_date, appointment_time)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12, 2) not null default 0,
  stock_quantity int not null default 0,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete restrict,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  paystack_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity int not null check (quantity > 0),
  price numeric(12, 2) not null
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  content text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_followups (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.users (id) on delete set null,
  target_user_id uuid references public.users (id) on delete set null,
  channel text not null check (channel in ('whatsapp', 'email')),
  message text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_appointments_date on public.appointments (appointment_date);
create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_order_items_order on public.order_items (order_id);

-- Helper: is current user admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select u.is_admin from public.users u where u.id = auth.uid()),
    false
  );
$$;

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.admin_followups enable row level security;

-- Users
create policy users_select_self_or_admin on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy users_update_self_or_admin on public.users
  for update using (id = auth.uid() or public.is_admin());

-- Services & products: public read, admin write
create policy services_read on public.services for select using (true);
create policy services_admin on public.services for all using (public.is_admin()) with check (public.is_admin());

create policy products_read on public.products for select using (true);
create policy products_admin on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Appointments
create policy appt_select on public.appointments
  for select using (user_id = auth.uid() or public.is_admin());
create policy appt_insert on public.appointments
  for insert with check (user_id = auth.uid() or public.is_admin());
create policy appt_update on public.appointments
  for update using (user_id = auth.uid() or public.is_admin());

-- Orders
create policy orders_select on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy orders_insert on public.orders
  for insert with check (user_id = auth.uid() or public.is_admin());
create policy orders_update on public.orders
  for update using (public.is_admin());

-- Order items
create policy oi_select on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
create policy oi_insert on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
    or public.is_admin()
  );
create policy oi_update on public.order_items
  for update using (public.is_admin());

-- Testimonials: public reads approved; insert could be admin-only — clients submit via app: allow insert for authenticated users, only approved visible to public
create policy testimonials_public on public.testimonials
  for select using (approved = true or public.is_admin());
create policy testimonials_insert on public.testimonials
  for insert with check (auth.uid() is not null);
create policy testimonials_admin on public.testimonials
  for update using (public.is_admin());

-- Followups admin only
create policy followups_admin on public.admin_followups
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed services (GHS placeholder pricing; runs once)
insert into public.services (name, description, price, duration_minutes, image)
select * from (values
  ('Traditional Chinese Medicine', 'Balanced TCM assessments and supportive herbal guidance tailored to your constitution.', 280, 90, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'),
  ('Traditional healing', 'Heritage-informed sessions combining plants, energy, and restorative practices.', 220, 75, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80'),
  ('Foot and hand reflexology', 'Targeted reflex work to ease tension and support natural recovery.', 150, 60, 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80'),
  ('Acupressure', 'Point-based therapy without needles for pain relief and relaxation.', 160, 45, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80'),
  ('Massage therapy', 'Therapeutic massage for stress relief, mobility, and whole-body calm.', 200, 60, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'),
  ('Healing with diet', 'Personalized food and herb-forward nutrition plans.', 180, 60, '/services/healing-with-diet.jpg'),
  ('Mindfulness and meditation', 'Guided breath and awareness practices for nervous system balance.', 120, 45, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'),
  ('Alternative healing practices', 'Integrative modalities matched to your wellness goals.', 190, 60, 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80'),
  ('Online tutoring', 'Virtual sessions for herbal studies, self-care skills, and Q&A.', 100, 50, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80')
) as v(name, description, price, duration_minutes, image)
where not exists (select 1 from public.services limit 1);

insert into public.products (name, description, price, stock_quantity, image)
select * from (values
  ('Herbal oil for skin', 'Nourishing botanical oil blend for daily skin care.', 85, 40, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'),
  ('Supplement products', 'Whole-food inspired herbal supplement support.', 120, 25, 'https://images.unsplash.com/photo-1550572017-4fcdbef40d27?w=800&q=80'),
  ('Herbal teas', 'Calming and restorative loose-leaf herbal tea selection.', 45, 60, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80')
) as v(name, description, price, stock_quantity, image)
where not exists (select 1 from public.products limit 1);

insert into public.testimonials (client_name, content, rating, approved)
select * from (values
  ('Ama K.', 'Warm, knowledgeable care — I left feeling grounded and seen.', 5, true),
  ('Kwame T.', 'The herbal consult gave me clear steps I could follow.', 5, true),
  ('Efua M.', 'Peaceful space and excellent reflexology.', 4, true)
) as v(client_name, content, rating, approved)
where not exists (select 1 from public.testimonials limit 1);

-- To bootstrap first admin after signup, run once (replace with your auth user id):
-- update public.users set is_admin = true where email = 'you@example.com';
