-- ============================================
-- OCEAN PRODUS — Migrare: intervale de livrare
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- ============================================

create table if not exists delivery_slots (
  id uuid primary key default uuid_generate_v4(),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Duminică ... 6=Sâmbătă
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

alter table delivery_slots enable row level security;

create policy "public read delivery_slots" on delivery_slots for select using (is_active = true);
create policy "admin all delivery_slots" on delivery_slots for all using (auth.role() = 'authenticated');

-- Reținem intervalul ales de client direct pe comandă (text simplu, ex. "Miercuri, 04.09 · 09:00–12:30")
alter table orders add column if not exists delivery_slot text;
