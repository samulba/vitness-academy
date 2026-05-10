# CLAUDE.md — Pflicht-Lektüre vor jedem Commit

Diese Datei dokumentiert die schmerzhaft gelernten Build-Regeln. **Vor jedem Push lokal `npm run check` ausführen** — fängt 100 % der Vercel-Build-Failures der Vergangenheit ab.

## Pre-Push-Check (NICHT optional)

```bash
npm run check     # = tsc --noEmit && next lint && next build
```

Wenn das lokal grün ist, baut Vercel auch grün. Wenn nicht, **nicht pushen**.

## Server-/Client-Component-Boundary (RSC)

Next.js App Router. Datei ohne Direktive = Server Component. `"use client"` oben = Client Component.

### ❌ KAPUTT: Funktion an Client-Component übergeben

```tsx
// app/admin/foo/page.tsx (Server Component)
const columns = [{ render: (row) => <span>{row.title}</span> }];
return <DataTable columns={columns} />;  // <DataTable> ist "use client" → CRASH
```

Fehler in Vercel-Logs: `Functions cannot be passed directly to Client Components`.

### ✅ FIX: Per Page einen Client-Wrapper

```tsx
// app/admin/foo/FooTable.tsx
"use client";
export function FooTable({ data }: { data: Foo[] }) {
  const columns = [{ render: (row) => <span>{row.title}</span> }];  // hier OK
  return <DataTable data={data} columns={columns} />;
}

// app/admin/foo/page.tsx (Server)
export default async function Page() {
  const data = await ladeFoo();
  return <FooTable data={data} />;
}
```

**Regel**: Server-Komponente reicht nur **Plain-Daten** (string, number, array, plain object) und **JSX-Children** an Client-Komponenten. Niemals Funktionen, niemals Maps/Sets.

## Server-only Module nicht in Client-Bundles

Module die `next/headers`, `cookies()`, `createClient` aus `lib/supabase/server` enthalten **dürfen nicht aus Client-Components importiert werden** (auch nicht transitiv).

### Faustregel
Wenn ein Lib-Modul Server-Loader UND Types exportiert, **Types in `lib/<name>-types.ts` ausziehen**:

- ✅ Existierende Splits: `lib/kontakte-types.ts`, `lib/maengel-types.ts`, `lib/infos-types.ts`, `lib/feedback-types.ts`, `lib/notifications-types.ts`, `lib/provisionen-types.ts`, `lib/formulare-types.ts`
- Server-Modul re-exportiert die Types: `export { type Kontakt } from "@/lib/kontakte-types";`
- Client-Component importiert direkt aus `-types`: `import type { Kontakt } from "@/lib/kontakte-types";`

`import type { … }` aus dem Server-Modul funktioniert auch (TypeScript erased), aber das `-types`-Pattern ist robuster und weniger fehleranfällig.

## Server Actions sind erlaubt im Client

Server Action = Funktion in einer Datei mit `"use server"` oben. Die darf aus Client-Components importiert + aufgerufen werden — Next.js wrappt sie in einen Proxy.

```ts
// lib/standort-context.ts
"use server";
export async function setAktiverStandort(id: string) { ... }

// components/layout/StandortSwitcher.tsx
"use client";
import { setAktiverStandort } from "@/lib/standort-context";  // ✅ OK
```

## try/catch darf Next.js-Control-Flow NICHT schlucken

`redirect()` und `notFound()` und Static-Render-Detection werfen besondere Errors mit `digest = "NEXT_REDIRECT"` etc. Wenn ein Wrapper-`try/catch` die schluckt, bricht alles.

```ts
// lib/admin/safe-loader.ts gibt es schon:
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";

try {
  ...
} catch (e) {
  if (istNextJsControlFlow(e)) throw e;   // ← PFLICHT
  console.error("[loader] failed:", e);
  return [];
}
```

## Layouts beider Segments sind dynamisch

Beide Layouts (`app/(admin)/admin/layout.tsx` und `app/(app)/layout.tsx`) haben:

```ts
export const dynamic = "force-dynamic";
```

Das ist Absicht — Auth-/Cookie-/RLS-basierte Pages **dürfen nicht statisch prerendert werden**. Nicht entfernen.

## Migrations-Workflow

1. SQL-Migration in `supabase/migrations/00XX_…sql` schreiben.
2. **User muss die Migration in Supabase Cloud manuell ausführen** (SQL Editor). Das ist nicht automatisch.
3. Im Commit die User-Aufgabe explizit erwähnen.
4. Defensive Loader (`lib/admin/safe-loader.ts`) sorgen dafür, dass die App auch funktioniert, bevor die Migration eingespielt wurde.

## Projekt-Konventionen

- **Sprache überall**: Deutsch (UI, Variablennamen wie `ladeKontakte`, `vollerName`).
- **Umlaute IMMER als ä/ö/ü/ß schreiben — NIE umschreiben** zu ae/oe/ue/ss. Gilt für:
  - **UI-Text** (JSX-Strings, Labels, Toast-Messages, Page-Header, Form-Placeholder)
  - **DB-Seed-Werte** für Display-Felder (z.B. `roles.name`, `roles.beschreibung`)
  - **Kommentare** im Code (z.B. `// Lädt die Daten …` statt `// Laedt die Daten …`)
  - **Commit-Messages** ("Berechtigungssystem", "Führungskraft", nicht "Berechtigungssystem", "Fuehrungskraft")
  - Einzige Ausnahme: **Code-Identifier** (Variablen, Funktionen, DB-Spalten, Enum-Werte). Dort bleibt `fuehrungskraft`, `oeffnen`, `ueberschrift` etc. — JS/SQL-Identifier können keine Umlaute haben.
- **Brand-Farbe**: `#b50f5f` Magenta, via CSS-Var `--primary`. Kein Grün, kein Lime.
- **Icons**: lucide-react.
- **Tabellen**: `components/ui/data-table.tsx`. Wegen RSC immer per Client-Wrapper (siehe oben).
- **Forms**: React-19 Server Actions. Nach Submit `revalidatePath` + `redirect("…?toast=…")`. Toast wird global von `components/ui/toast-flash.tsx` gehandhabt.
- **Error-Boundaries**: `app/(admin)/error.tsx`, `app/(app)/error.tsx`, `app/global-error.tsx` fangen alle Render-Errors ab. Müssen erhalten bleiben.

## Git-Workflow

User pusht direkt auf `main`. Pro logischer Änderung **ein Commit**. Nach jedem Commit:

```bash
npm run check && git push
```

Wenn `npm run check` rot ist → erst fixen, dann pushen.
