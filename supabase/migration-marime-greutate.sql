-- ============================================
-- OCEAN PRODUS — Migrare: mărime pachet + greutate
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- (Se poate rula în siguranță chiar dacă ai deja tabelul products.)
-- ============================================

alter table products add column if not exists size text;
alter table products add column if not exists weight_note text;
