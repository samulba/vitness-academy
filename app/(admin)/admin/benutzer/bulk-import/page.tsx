import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BulkImportForm } from "./BulkImportForm";

export default async function BulkImportPage() {
  await requirePermission("benutzer", "create");
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select("id, title")
    .eq("status", "aktiv")
    .order("sort_order");

  const lernpfade = (data ?? []) as { id: string; title: string }[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Mitarbeiter", href: "/admin/benutzer" },
          { label: "CSV-Import" },
        ]}
        eyebrow="Onboarding"
        title="CSV-Bulk-Import"
        description="Mehrere Mitarbeiter in einem Rutsch anlegen — alle erhalten einen Magic-Link per E-Mail und setzen ihr Passwort selbst."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">Format</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Eine Zeile pro Mitarbeiter, erste Zeile sind die Spalten-Namen.
          </p>
        </div>
        <div className="space-y-3 p-5">
          <ul className="space-y-1.5 text-sm">
            <li className="text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                vorname
              </code>
              ,{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                nachname
              </code>
              ,{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                email
              </code>{" "}
              — alle drei Pflicht
            </li>
            <li className="text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                rolle
              </code>{" "}
              — <em>mitarbeiter</em> oder <em>fuehrungskraft</em> (Default:
              mitarbeiter)
            </li>
            <li className="text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                lernpfade
              </code>{" "}
              — Lernpfad-Titel, mehrere mit{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                ;
              </code>{" "}
              getrennt
            </li>
          </ul>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs">
            {`vorname,nachname,email,rolle,lernpfade
Lara,Mustermann,lara@example.com,mitarbeiter,Theke und Empfang;Magicline
Tom,Schmidt,tom@example.com,fuehrungskraft,Theke und Empfang
Anna,Weber,anna@example.com,mitarbeiter,`}
          </pre>
        </div>
      </div>

      <BulkImportForm lernpfade={lernpfade} />
    </div>
  );
}
