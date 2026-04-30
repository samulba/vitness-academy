import { PageHeader } from "@/components/ui/page-header";
import { ArtikelFormular } from "@/components/admin/ArtikelFormular";
import { createClient } from "@/lib/supabase/server";
import { artikelAnlegen } from "../actions";

async function ladeKategorien() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_categories")
    .select("id, name")
    .order("sort_order", { ascending: true });
  return (data ?? []) as { id: string; name: string }[];
}

export default async function NeuerArtikelPage() {
  const kategorien = await ladeKategorien();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Handbuch", href: "/admin/wissen" },
          { label: "Neu" },
        ]}
        eyebrow="Artikel"
        title="Neuer Wissensartikel"
        description="Markdown-Body, Kategorie zuordnen, Status setzen — und live geht's."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">Inhalt</h2>
        </div>
        <div className="p-5">
          <ArtikelFormular
            modus="anlegen"
            action={artikelAnlegen}
            kategorien={kategorien}
          />
        </div>
      </div>
    </div>
  );
}
