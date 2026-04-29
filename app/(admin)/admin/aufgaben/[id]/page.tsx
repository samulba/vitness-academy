import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ladeAufgabe } from "@/lib/aufgaben";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { AufgabeForm } from "../AufgabeForm";
import { aufgabeAktualisieren, aufgabeLoeschen } from "../actions";

export default async function AufgabeBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "superadmin"]);
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
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/admin/aufgaben"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Aufgaben
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Aufgaben
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Aufgabe bearbeiten
        </h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
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

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Aufgabe löschen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Bei Templates werden auch alle generierten Instanzen mitgelöscht.
        </p>
        <div className="mt-4">
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
