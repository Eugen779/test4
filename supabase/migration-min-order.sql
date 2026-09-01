-- ============================================
-- OCEAN PRODUS — Migrare: comandă minimă configurabilă
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- ============================================

alter table settings add column if not exists min_order_enabled boolean default false;
alter table settings add column if not exists min_order_amount numeric(10,2) default 250;
