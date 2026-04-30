import { PageHeader } from "@/components/ui/page-header";
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
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Praxisaufgaben", href: "/admin/praxisaufgaben" },
          { label: "Neu" },
        ]}
        eyebrow="Praxisaufgabe"
        title="Neue Praxisaufgabe"
        description="Vorlage für Mitarbeiter, die eine praktische Aufgabe abschließen sollen. Anfragen pflegt die Studioleitung dann unter Anfragen."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Stammdaten
          </h2>
        </div>
        <div className="p-5">
          <AufgabenFormular
            modus="anlegen"
            action={aufgabeAnlegen}
            pfade={pfade}
            module={module}
            lektionen={lektionen}
          />
        </div>
      </div>
    </div>
  );
}
