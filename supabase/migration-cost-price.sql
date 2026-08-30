-- ============================================
-- OCEAN PRODUS — Migrare: preț de achiziție (cost)
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- ============================================

alter table products add column if not exists cost_price numeric(10,2);
