import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AufgabenFormular } from "@/components/admin/AufgabenFormular";
import {
  ladeLektionOptionen,
  ladeModulOptionen,
  ladePfadOptionen,
} from "@/lib/admin/optionen";
import { aufgabeAnlegen } from "../actions";

export default async function NeueAufgabePage() {
  const [pfade, module, lektionen] = await Promise.all([
    ladePfadOptionen(),
    ladeModulOptionen(),
    ladeLektionOptionen(),
  ]);

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
          Neue Praxisaufgabe
        </h1>
      </header>

      <AufgabenFormular
        modus="anlegen"
        action={aufgabeAnlegen}
        pfade={pfade}
        module={module}
        lektionen={lektionen}
      />
    </div>
  );
}
