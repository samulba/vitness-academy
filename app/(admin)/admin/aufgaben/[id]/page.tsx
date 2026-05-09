import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ladeAufgabe } from "@/lib/aufgaben";
import { AufgabeForm } from "../AufgabeForm";
import { aufgabeAktualisieren, aufgabeLoeschen } from "../actions";

export default async function AufgabeBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const { id } = await params;
  const a = await ladeAufgabe(id);
  if (!a) notFound();

  const supabase = await createClient();
  const { data: m } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["mitarbeiter", "fuehrungskraft"])
    .order("full_name", { ascending: true });
  const mitarbeiter = ((m ?? []) as { id: string; full_name: string | null }[])
    .map((p) => ({ id: p.id, name: p.full_name ?? "—" }));

  const aktualisieren = aufgabeAktualisieren.bind(null, id);
  const loeschen = aufgabeLoeschen.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Aufgaben", href: "/admin/aufgaben" },
          { label: a.title },
        ]}
        eyebrow="Aufgabe"
        title={a.title}
        description={
          a.recurrence === "none"
            ? "Einmalige Aufgabe — Empfänger, Fälligkeit und Priorität pflegen."
            : `Wiederholende Aufgabe (${a.recurrence === "daily" ? "täglich" : "wöchentlich"}).`
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Stammdaten
          </h2>
        </div>
        <div className="p-5">
          <AufgabeForm
            action={aktualisieren}
            modus="bearbeiten"
            mitarbeiter={mitarbeiter}
            initial={{
              title: a.title,
              description: a.description,
              assigned_to: a.assigned_to,
              due_date: a.due_date,
              priority: a.priority,
              recurrence: a.recurrence,
              active: a.active,
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-destructive/25 bg-destructive/[0.03]">
        <div className="border-b border-destructive/20 px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight text-destructive">
            Aufgabe löschen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bei Templates werden auch alle generierten Instanzen mitgelöscht.
          </p>
        </div>
        <div className="p-5">
          <LoeschenButton
            action={loeschen}
            label="Aufgabe endgültig löschen"
            bestaetigung="Diese Aufgabe wirklich löschen?"
          />
        </div>
      </div>
    </div>
  );
}
