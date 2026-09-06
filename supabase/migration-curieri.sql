-- ============================================
-- OCEAN PRODUS — Migrare: sistem curieri
-- Rulează în Supabase: SQL Editor > New query > lipești tot > Run
-- ============================================

-- Numele curierului care a preluat comanda (simplu, fără cont separat —
-- curierul își scrie numele o singură dată pe telefonul lui).
alter table orders add column if not exists courier_name text;

-- Cod PIN simplu, editabil din admin → Setări, ca doar curierii tăi să poată
-- intra în pagina de preluare comenzi.
alter table settings add column if not exists courier_pin text default '0000';
