-- ============================================
-- OCEAN PRODUS — Schema Supabase
-- Rulează acest fișier în Supabase: SQL Editor > New query > Run
-- ============================================

create extension if not exists "uuid-ossp";

-- ---------- SETĂRI GENERALE MAGAZIN ----------
create table if not exists settings (
  id int primary key default 1,
  store_name text not null default 'Ocean Produs',
  tagline text default 'Calitate superioară direct din ocean',
  logo_url text,
  primary_color text default '#C8342E',
  currency text default 'lei',
  phone text,
  email text,
  address text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ---------- CATEGORII ----------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  image_url text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- PRODUSE ----------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2), -- preț tăiat, pentru reduceri
  stock int default 0,
  unit text default 'buc', -- buc, kg, borcan etc.
  images text[] default '{}', -- array de URL-uri din Supabase Storage
  is_active boolean default true,
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- BANNERE / HOMEPAGE ----------
create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  subtitle text,
  image_url text not null,
  button_text text default 'Vezi produse',
  button_link text default '/produse',
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- COMENZI ----------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text not null,
  status text not null default 'noua' check (status in ('noua','confirmata','in_livrare','livrata','anulata')),
  total numeric(10,2) not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null, -- snapshot la momentul comenzii
  unit_price numeric(10,2) not null,
  quantity int not null,
  subtotal numeric(10,2) not null
);

-- ---------- INDEXURI ----------
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_orders_status on orders(status);

-- ---------- ROW LEVEL SECURITY ----------
alter table settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table banners enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Citire publică (magazinul, orice vizitator)
create policy "public read settings" on settings for select using (true);
create policy "public read categories" on categories for select using (is_active = true);
create policy "public read products" on products for select using (is_active = true);
create policy "public read banners" on banners for select using (is_active = true);

-- Oricine poate crea o comandă (checkout public), dar nu poate citi comenzile altora
create policy "public insert orders" on orders for insert with check (true);
create policy "public insert order_items" on order_items for insert with check (true);

-- Scriere/editare/ștergere: doar utilizatori autentificați (adminul tău)
create policy "admin write settings" on settings for update using (auth.role() = 'authenticated');
create policy "admin all categories" on categories for all using (auth.role() = 'authenticated');
create policy "admin all products" on products for all using (auth.role() = 'authenticated');
create policy "admin all banners" on banners for all using (auth.role() = 'authenticated');
create policy "admin read orders" on orders for select using (auth.role() = 'authenticated');
create policy "admin update orders" on orders for update using (auth.role() = 'authenticated');
create policy "admin read order_items" on order_items for select using (auth.role() = 'authenticated');

-- ---------- STORAGE BUCKET PENTRU IMAGINI ----------
insert into storage.buckets (id, name, public) values ('images', 'images', true)
  on conflict (id) do nothing;

create policy "public read images" on storage.objects for select using (bucket_id = 'images');
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "admin update images" on storage.objects for update using (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'images' and auth.role() = 'authenticated');
