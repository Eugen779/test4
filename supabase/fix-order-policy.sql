-- ============================================
-- OCEAN PRODUS — Reparare: permisiune trimitere comenzi
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- ============================================

alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "public insert orders" on orders;
create policy "public insert orders" on orders for insert with check (true);

drop policy if exists "public insert order_items" on order_items;
create policy "public insert order_items" on order_items for insert with check (true);
