import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { AufgabenFormular } from "@/components/admin/AufgabenFormular";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { createClient } from "@/lib/supabase/server";
import {
  ladeLektionOptionen,
  ladeModulOptionen,
  ladePfadOptionen,
} from "@/lib/admin/optionen";
import { aufgabeAktualisieren, aufgabeLoeschen } from "../actions";

async function ladeAufgabe(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("practical_tasks")
    .select(
      `id, title, description, status,
       learning_path_id, module_id, lesson_id`,
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export default async function AufgabeBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [aufgabe, pfade, module, lektionen] = await Promise.all([
    ladeAufgabe(id),
    ladePfadOptionen(),
    ladeModulOptionen(),
    ladeLektionOptionen(),
  ]);
  if (!aufgabe) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Praxisaufgaben", href: "/admin/praxisaufgaben" },
          { label: aufgabe.title },
        ]}
        eyebrow="Praxisaufgabe"
        title={aufgabe.title}
        description="Vorlage für Praxisfreigaben — pflege Verknüpfung zu Pfad/Modul/Lektion."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Stammdaten
          </h2>
        </div>
        <div className="p-5">
          <AufgabenFormular
            modus="bearbeiten"
            action={aufgabeAktualisieren.bind(null, aufgabe.id)}
            pfade={pfade}
            module={module}
            lektionen={lektionen}
            werte={{
              title: aufgabe.title,
              description: aufgabe.description,
              status: aufgabe.status,
              learning_path_id: aufgabe.learning_path_id,
              module_id: aufgabe.module_id,
              lesson_id: aufgabe.lesson_id,
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
            Inklusive aller eingegangenen Anfragen.
          </p>
        </div>
        <div className="p-5">
          <LoeschenButton
            action={aufgabeLoeschen.bind(null, aufgabe.id)}
            label="Aufgabe endgültig löschen"
            bestaetigung="Aufgabe inkl. aller Anfragen wirklich löschen?"
          />
        </div>
      </div>
    </div>
  );
}
