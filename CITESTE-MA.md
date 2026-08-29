# Ocean Produs — ghid de pornire

Ai primit codul complet al magazinului: site public + panou de admin, conectate
la Supabase. Tot ce vezi în magazin (produse, categorii, comenzi, bannere de pe
homepage) se editează din `/admin`, fără să atingi codul niciodată.

## Pasul 1 — Creează contul și proiectul Supabase

1. Intră pe https://supabase.com și creează un cont gratuit.
2. Apasă „New project", alege un nume (ex. `ocean-produs`) și o parolă pentru
   baza de date (păstreaz-o undeva sigur).
3. Așteaptă ~2 minute până se creează proiectul.

## Pasul 2 — Instalează schema bazei de date

1. În Supabase, mergi la **SQL Editor** din meniul din stânga.
2. Apasă „New query".
3. Deschide fișierul `supabase/schema.sql` din acest proiect, copiază tot
   conținutul și lipește-l în editor.
4. Apasă „Run". Asta creează toate tabelele (produse, categorii, comenzi,
   bannere), regulile de securitate și locul de stocare pentru imagini.

## Pasul 3 — Ia cheile de conectare

1. Mergi la **Project Settings > API**.
2. Copiază „Project URL" și cheia „anon public".
3. Redenumește fișierul `.env.local.example` din proiect în `.env.local` și
   completează cele două valori acolo.
4. În `next.config.ts`, înlocuiește `*.supabase.co` cu domeniul exact al
   proiectului tău (îl vezi în „Project URL").

## Pasul 4 — Creează-ți contul de admin

1. În Supabase, mergi la **Authentication > Users**.
2. Apasă „Add user" → „Create new user".
3. Pune email-ul și parola cu care vrei să te loghezi în `/admin`.

## Pasul 5 — Rulează local (ca să vezi cum arată)

Ai nevoie de [Node.js](https://nodejs.org) instalat. Apoi, în terminal, în
folderul proiectului:

```
npm install
npm run dev
```

Deschide `http://localhost:3000` pentru magazin și `http://localhost:3000/admin`
pentru panoul de administrare (login cu contul creat la pasul 4).

## Pasul 6 — Publică site-ul online

Cel mai simplu: [Vercel](https://vercel.com) (gratuit pentru proiecte mici).

1. Urcă acest folder pe GitHub (ca repo nou).
2. Pe Vercel: „Add New Project" → alege repo-ul.
3. La „Environment Variables", adaugă aceleași două valori din `.env.local`.
4. Apasă „Deploy". În câteva minute ai un link live.

## Cum adaugi conținut

Din `/admin`:
- **Produse** — nume, preț, poze (le încarci direct de pe telefon/calculator),
  stoc, categorie, plus un buton „pus în evidență" pentru secțiunea de pe
  homepage.
- **Categorii** — nume + poza rotundă din pagina principală.
- **Bannere & Homepage** — pozele mari din slider-ul de sus, cu titlu,
  subtitlu și buton — exact ca "Icre premium" din referința ta.
- **Comenzi** — vezi comenzile primite și le schimbi statusul.

## Ce mai lipsește / de discutat

Codul livrat acoperă homepage-ul, categoriile, produsele și tot panoul de
admin (CRUD complet). Paginile de checkout complet (formular comandă client),
pagina de produs individual și pagina de listă completă produse pot fi
adăugate în pasul următor — spune-mi și continuăm cu ele.
