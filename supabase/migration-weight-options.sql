-- ============================================
-- OCEAN PRODUS — Migrare: variante de greutate (produse la kg)
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- ============================================

alter table products add column if not exists weight_options integer[];
-- weight_options reține până la 3 greutăți în grame, ex: '{700,1000,2000}'
-- Se folosește doar pentru produsele cu unit = 'kg'.
