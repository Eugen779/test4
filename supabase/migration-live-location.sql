-- ============================================
-- OCEAN PRODUS — Migrare: locație live la livrare
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- ============================================

alter table orders add column if not exists current_lat double precision;
alter table orders add column if not exists current_lng double precision;
alter table orders add column if not exists location_updated_at timestamptz;

-- Coordonatele adresei de livrare, confirmate din sugestiile de căutare
-- (folosite pentru traseu și timp estimat de sosire).
alter table orders add column if not exists delivery_lat double precision;
alter table orders add column if not exists delivery_lng double precision;
