import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AufgabeForm } from "../AufgabeForm";
import { aufgabeAnlegen } from "../actions";

export default async function NeueAufgabePage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["mitarbeiter", "fuehrungskraft"])
    .order("full_name", { ascending: true });
  const mitarbeiter = ((data ?? []) as { id: string; full_name: string | null }[])
    .map((m) => ({ id: m.id, name: m.full_name ?? "—" }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Aufgaben", href: "/admin/aufgaben" },
          { label: "Neu" },
        ]}
        eyebrow="Aufgabe"
        title="Neue Aufgabe"
        description="Einmalig oder wiederholend (täglich/wöchentlich), für eine Person oder fürs Team."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Aufgaben-Daten
          </h2>
        </div>
        <div className="p-5">
          <AufgabeForm
            action={aufgabeAnlegen}
            modus="neu"
            mitarbeiter={mitarbeiter}
          />
        </div>
      </div>
    </div>
  );
}
