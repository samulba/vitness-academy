import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-6">
      <Link
        href="/admin/praxisaufgaben"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Praxisaufgaben
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          {aufgabe.title}
        </h1>
      </header>

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

      <Card>
        <CardContent className="flex justify-end py-4">
          <LoeschenButton
            action={aufgabeLoeschen.bind(null, aufgabe.id)}
            label="Aufgabe löschen"
            bestaetigung="Aufgabe inkl. aller Anfragen wirklich löschen?"
          />
        </CardContent>
      </Card>
    </div>
  );
}
