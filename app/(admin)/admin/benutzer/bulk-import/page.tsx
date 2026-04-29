import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BulkImportForm } from "./BulkImportForm";

export default async function BulkImportPage() {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select("id, title")
    .eq("status", "aktiv")
    .order("sort_order");

  const lernpfade = (data ?? []) as { id: string; title: string }[];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/admin/benutzer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Benutzern
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Verwaltung · Mitarbeiter
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.5rem)]">
          CSV-Bulk-Import
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Mehrere Mitarbeiter in einem Rutsch anlegen — alle erhalten einen
          Magic-Link per E-Mail und setzen ihr Passwort selbst.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Format
        </h2>
        <p className="mt-3 text-sm">
          Eine Zeile pro Mitarbeiter, erste Zeile sind die Spalten-Namen.
          Erlaubte Spalten:
        </p>
        <ul className="mt-2 ml-5 list-disc text-sm text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              vorname
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              nachname
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              email
            </code>{" "}
            (alle drei Pflicht)
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              rolle
            </code>
            : <em>mitarbeiter</em> oder <em>fuehrungskraft</em> (Default:
            mitarbeiter)
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              lernpfade
            </code>
            : Lernpfad-Titel, mehrere mit{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">;</code>{" "}
            getrennt
          </li>
        </ul>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs">
          {`vorname,nachname,email,rolle,lernpfade
Lara,Mustermann,lara@example.com,mitarbeiter,Theke und Empfang;Magicline
Tom,Schmidt,tom@example.com,fuehrungskraft,Theke und Empfang
Anna,Weber,anna@example.com,mitarbeiter,`}
        </pre>
      </section>

      <BulkImportForm lernpfade={lernpfade} />
    </div>
  );
}
