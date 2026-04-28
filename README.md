# Vitness Akademie

Interne Schulungsplattform für Fitnessstudio-Mitarbeiter mit Lernpfaden, Lektionen, Quizzen, Praxisfreigaben und Wissensdatenbank.

> Aktueller Stand: **Iteration 1** – Login, rollenbasierte Navigation, Mitarbeiter-Dashboard, Lernpfade, Module, Lektionen mit Inhalts-Blöcken und „Lektion abschließen". Iteration 2 (Quiz + Praxisfreigaben) und Iteration 3 (Wissensdatenbank + voller Admin-CRUD) folgen.

## Tech-Stack

- [Next.js 15](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) (Auth, Postgres, RLS)
- Lokale Entwicklung via [Supabase CLI](https://supabase.com/docs/guides/cli) (Docker)

## Voraussetzungen

- Node.js ≥ 20 (empfohlen: 22)
- npm ≥ 10
- Docker Desktop (für lokales Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

```bash
# Installation Supabase CLI (macOS)
brew install supabase/tap/supabase

# Linux / Windows: siehe Supabase-Doku
```

## Erste Schritte

```bash
# 1) Repository klonen und Abhängigkeiten installieren
git clone <repo-url> vitness-academy
cd vitness-academy
npm install

# 2) Lokales Supabase starten (Docker muss laufen)
supabase start

# Die CLI gibt am Ende die URLs und Keys aus, z.B.:
#   API URL:        http://127.0.0.1:54321
#   Studio URL:     http://127.0.0.1:54323
#   Inbucket URL:   http://127.0.0.1:54324
#   anon key:       eyJhbGciOiJIUzI1NiIs...
#   service_role key: eyJhbGciOiJIUzI1NiIs...

# 3) .env.local anlegen
cp .env.example .env.local
# Trage NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY aus dem
# `supabase start`-Output ein.

# 4) Schema + Seed laden (nur beim allerersten Start oder nach Aenderungen)
supabase db reset

# 5) Dev-Server starten
npm run dev
# -> http://localhost:3000
```

## Demo-Accounts (alle Passwort: `passwort123`)

| E-Mail | Rolle | Was sieht man? |
| --- | --- | --- |
| `mitarbeiter@example.com` | Mitarbeiter | Dashboard, Lernpfad „Theke und Empfang", Lektionen abschließen |
| `fuehrungskraft@example.com` | Führungskraft | Wie Mitarbeiter + Verwaltungsbereich (lesend) |
| `admin@example.com` | Admin | Voller Verwaltungsbereich |

## Projektstruktur

```
app/
  (app)/                     # geschuetzte Mitarbeiter-Routen
    dashboard/
    lernpfade/
      [id]/
    lektionen/
      [id]/
  (admin)/                   # geschuetzte Admin-Routen
    admin/
      benutzer/
      lernpfade/
  login/
  layout.tsx
  page.tsx                   # leitet je nach Rolle weiter
components/
  ui/                        # shadcn/ui-Komponenten
  layout/                    # Topbar, Sidebar, MobileNav
  lernpfad/                  # PfadCard, ModulAccordion
  lektion/                   # ContentBlock, Buttons
lib/
  auth.ts                    # Profil/Rollen-Helper, requireRole
  format.ts                  # Datum, Prozent, Rollen-Labels
  lernpfade.ts               # Datenzugriff Lernpfade + Fortschritt
  lektion.ts                 # Datenzugriff einzelne Lektion
  supabase/                  # client.ts, server.ts, middleware.ts
  utils.ts                   # cn(...) Helper
supabase/
  config.toml                # Lokale Supabase-Konfiguration
  migrations/
    0001_init.sql            # Tabellen, Trigger, Helper-Funktionen
    0002_rls.sql             # Row Level Security Policies
  seed.sql                   # Demo-Lernpfad und Demo-Accounts
middleware.ts                # Schuetzt Routen ausserhalb /login
```

## Datenmodell (Iteration 1)

| Tabelle | Zweck |
| --- | --- |
| `locations` | Studio-Standorte (Vorbereitung Mehrstandort) |
| `profiles` | 1:1 mit `auth.users`, hält Rolle und Standort |
| `learning_paths` | Lernpfade |
| `modules` | Module innerhalb eines Lernpfads |
| `lessons` | Lektionen innerhalb eines Moduls |
| `lesson_content_blocks` | Inhalts-Blöcke (Markdown, Checkliste, Hinweis, Video-URL) |
| `user_learning_path_assignments` | welcher Mitarbeiter hat welchen Lernpfad |
| `user_lesson_progress` | Fortschritt je Mitarbeiter und Lektion |

Rollen: `mitarbeiter`, `fuehrungskraft`, `admin`, `superadmin`. Standortfelder sind bereits eingebaut, im UI aber noch nicht aktiv.

## Häufige Befehle

```bash
npm run dev          # Dev-Server
npm run build        # Production-Build
npm run start        # Production-Server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:types     # Supabase-Typen generieren -> types/db.ts

supabase start       # Lokales Supabase starten
supabase stop        # Lokales Supabase stoppen
supabase db reset    # Schema neu aufbauen + Seed laden
supabase status      # Aktuelle Keys/URLs anzeigen
```

## Roadmap

**Iteration 2 – Quizze + Praxisfreigaben**
- Migration `0003_quiz_practical.sql`
- `/quiz/[id]` mit Single/Multiple Choice
- `/praxisfreigaben` Inbox für Führungskraft/Admin

**Iteration 3 – Wissensdatenbank + voller Admin-CRUD**
- Migration `0004_knowledge.sql`
- `/wissen` mit Kategorien und Suche
- Admin-CRUD für Lernpfade, Module, Lektionen, Quizze, Wissensartikel und Benutzer
- `/admin/fortschritt` Auswertung

**Spätere Iterationen**
- Anhänge / Storage
- Mehrstandort-Filter im UI
- E-Mail-Templates für Invites

## Hinweise

- Die App ist komplett auf Deutsch (UI, Routen, Datenbank-Werte).
- Self-Signup ist deaktiviert. Mitarbeiter werden vom Admin angelegt.
- RLS ist aktiv: Mitarbeiter sehen nur eigene Profile/Fortschritte; Admins sehen alles.
