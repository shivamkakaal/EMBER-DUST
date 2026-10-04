-- Ember Dust Initial Database Schema
-- Version 1.0 (Based on PRD.md)

create extension if not exists "pgcrypto";

-- Sequence for order numbers (ED-YYYYMMDD-XXXX)
create sequence if not exists order_number_seq start with 1;

-- 1. Admin roles (Supabase Auth users flagged as admin)
create table if not exists admin_users (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);

-- 2. Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories on delete set null,
  slug text unique not null,
  name text not null,
  short_description text,
  description_md text,
  images text[] default '{}',
  unit text not null default 'kg',
  pricing_mode text not null default 'tiered' check (pricing_mode in ('tiered', 'per_unit', 'fixed')),
  base_price numeric(10,2) not null,
  min_qty numeric(10,2) default 1,
  max_qty numeric(10,2) default 1000,
  qty_step numeric(10,2) default 1,
  preset_quantities numeric[] default '{1,5,100}',
  attributes jsonb default '{}',
  stock_status text default 'in_stock' check (stock_status in ('in_stock', 'low', 'out_of_stock')),
  is_featured boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Price Tiers (Bulk discounts)
create table if not exists price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products on delete cascade,
  min_qty numeric(10,2) not null,
  price_per_unit numeric(10,2) not null,
  label text,
  unique (product_id, min_qty)
);

-- 5. Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text,
  customer_phone text,
  delivery_address text,
  notes text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  currency text default 'INR',
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  source text default 'whatsapp',
  tracking_info text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Order Items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete cascade,
  product_id uuid references products on delete set null,
  product_name text not null,
  quantity numeric(10,2) not null,
  unit text not null,
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

-- 7. Order Status History
create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete cascade,
  status text not null,
  changed_by uuid references auth.users,
  changed_at timestamptz default now()
);

-- 8. Site Settings (Key/value CMS)
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users
);

-- Indexes
create index if not exists idx_products_cat_active on products (category_id, is_active, sort_order);
create index if not exists idx_orders_status_date on orders (status, created_at desc);
create index if not exists idx_order_items_order on order_items (order_id);

-- Helper Function: Check Admin
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- Trigger: Auto-generate order number (e.g. ED-20261005-0001)
create or replace function generate_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'ED-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_order_number on orders;
create trigger trg_set_order_number
before insert on orders
for each row
execute function generate_order_number();

-- Trigger: Record order status changes
create or replace function log_order_status_change()
returns trigger language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_status_history on orders;
create trigger trg_order_status_history
after insert or update of status on orders
for each row
execute function log_order_status_change();

-- Enable Row Level Security (RLS)
alter table categories enable row level security;
alter table products enable row level security;
alter table price_tiers enable row level security;
alter table site_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table admin_users enable row level security;

-- RLS Policies: Public read
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (is_active);

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (is_active);

drop policy if exists "public read tiers" on price_tiers;
create policy "public read tiers" on price_tiers for select using (true);

drop policy if exists "public read settings" on site_settings;
create policy "public read settings" on site_settings for select using (true);

-- RLS Policies: Admin full access
drop policy if exists "admin all categories" on categories;
create policy "admin all categories" on categories for all using (is_admin()) with check (is_admin());

drop policy if exists "admin all products" on products;
create policy "admin all products" on products for all using (is_admin()) with check (is_admin());

drop policy if exists "admin all tiers" on price_tiers;
create policy "admin all tiers" on price_tiers for all using (is_admin()) with check (is_admin());

drop policy if exists "admin all settings" on site_settings;
create policy "admin all settings" on site_settings for all using (is_admin()) with check (is_admin());

drop policy if exists "admin all orders" on orders;
create policy "admin all orders" on orders for all using (is_admin()) with check (is_admin());

drop policy if exists "admin all items" on order_items;
create policy "admin all items" on order_items for all using (is_admin()) with check (is_admin());

drop policy if exists "admin all history" on order_status_history;
create policy "admin all history" on order_status_history for all using (is_admin()) with check (is_admin());

drop policy if exists "admin all admin_users" on admin_users;
create policy "admin all admin_users" on admin_users for all using (is_admin()) with check (is_admin());

-- Seed Data: Sample Site Settings
insert into site_settings (key, value)
values
(
  'hero',
  '{
    "eyebrow": "Small-batch · Organic",
    "headline": "Pure Ash. Rich Earth.",
    "subheadline": "Premium wood ash for soil that thrives and clay that sings.",
    "background_image": "/images/hero-ash.jpg",
    "overlay_opacity": 0.45,
    "cta_label": "Order on WhatsApp",
    "show_calculator": true
  }'::jsonb
),
(
  'whatsapp',
  '{
    "number": "919876543210",
    "business_name": "Ember Dust",
    "greeting": "Hello Ember Dust 👋"
  }'::jsonb
),
(
  'seo',
  '{
    "title": "Ember Dust — Pure Wood Ash for Gardeners & Ceramicists",
    "description": "Premium small-batch wood ash for soil potassium enrichment, pest deterrence, and studio pottery glaze flux."
  }'::jsonb
),
(
  'announcement',
  '{
    "enabled": true,
    "text": "✨ Fresh autumn batch sieved and ready for shipping across India. Free delivery over ₹999."
  }'::jsonb
)
on conflict (key) do update set value = excluded.value;

-- Seed Data: Sample Categories
insert into categories (id, slug, name, description, sort_order, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'gardening', 'Gardening & Soil', 'High potassium organic wood ash for balanced soil pH, fruiting crops, and natural pest barrier.', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'ceramics', 'Pottery & Ceramics', 'Ultra-fine double-sieved hardwood and plant ash for crystalline, tenmoku, and celadon glazes.', 2, true)
on conflict (slug) do nothing;

-- Seed Data: Sample Featured Product & Price Tiers
insert into products (
  id, category_id, slug, name, short_description, description_md,
  unit, pricing_mode, base_price, min_qty, max_qty, qty_step, preset_quantities,
  attributes, stock_status, is_featured, is_active, sort_order
)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'pure-hardwood-ash',
  'Pure Hardwood Ash (Screened & Pure)',
  'Organic soil enhancer rich in potassium, calcium, and trace minerals. 100% natural.',
  '## Pure Organic Hardwood Ash\n\nDerived from slow-burned chemical-free hardwood. Triple screened to remove charcoal chunks and debris.\n\n### Benefits\n- Boosts potassium (K) for flowering and root growth\n- Gently corrects acidic soil\n- Natural physical barrier against slugs and snails',
  'kg', 'tiered', 120.00, 1, 1000, 1, '{1,5,25,100}',
  '{"ash_type": "hardwood", "sieved": true, "ph_level": "9.5-10.5", "origin": "Himachal Pradesh"}'::jsonb,
  'in_stock', true, true, 1
)
on conflict (slug) do nothing;

insert into price_tiers (product_id, min_qty, price_per_unit, label)
values
  ('33333333-3333-3333-3333-333333333333', 1, 120.00, 'Standard'),
  ('33333333-3333-3333-3333-333333333333', 5, 95.00, 'Garden Pack (Save 20%)'),
  ('33333333-3333-3333-3333-333333333333', 25, 75.00, 'Bulk Bag (Save 37%)'),
  ('33333333-3333-3333-3333-333333333333', 100, 55.00, 'Studio / Farm (Save 54%)')
on conflict (product_id, min_qty) do nothing;
