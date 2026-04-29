import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatusPill } from "@/components/admin/StatusPill";
import {
  AdminActionCell,
  AdminTable,
  AdminTableEmpty,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTitleCell,
  AdminTr,
} from "@/components/admin/AdminTable";
import { createClient } from "@/lib/supabase/server";
import { formatDatum } from "@/lib/format";
import { lernpfadReihenfolge } from "./actions";

type Zeile = {
  id: string;
  title: string;
  status: string;
  module_anzahl: number;
  lektion_anzahl: number;
  zugewiesen: number;
  updated_at: string;
};

async function ladeLernpfade(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select(
      `id, title, status, updated_at, sort_order,
       modules ( id, lessons ( id ) ),
       user_learning_path_assignments ( id )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    modules: { id: string; lessons: { id: string }[] }[] | null;
    user_learning_path_assignments: { id: string }[] | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    module_anzahl: (p.modules ?? []).length,
    lektion_anzahl: (p.modules ?? []).reduce(
      (s, m) => s + (m.lessons ?? []).length,
      0,
    ),
    zugewiesen: (p.user_learning_path_assignments ?? []).length,
    updated_at: p.updated_at,
  }));
}

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv") return <StatusPill ton="success">Aktiv</StatusPill>;
  if (status === "entwurf")
    return <StatusPill ton="warn">Entwurf</StatusPill>;
  return <StatusPill ton="neutral">Archiviert</StatusPill>;
}

export default async function AdminLernpfadeListe() {
  const pfade = await ladeLernpfade();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Lernpfade"
        description="Reihenfolge bestimmt die Anzeige im Mitarbeiter-Bereich."
        actions={
          <AdminButton href="/admin/lernpfade/neu">
            <Plus className="h-3.5 w-3.5" />
            Neuer Lernpfad
          </AdminButton>
        }
      />

      <AdminCard>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Titel</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh align="right">Module</AdminTh>
            <AdminTh align="right">Lektionen</AdminTh>
            <AdminTh align="right">Zuweisungen</AdminTh>
            <AdminTh>Aktualisiert</AdminTh>
            <AdminTh align="right">Reihenfolge</AdminTh>
            <AdminTh align="right">Vorschau</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {pfade.length === 0 ? (
              <AdminTableEmpty colSpan={9}>
                Noch keine Lernpfade angelegt.
              </AdminTableEmpty>
            ) : (
              pfade.map((p, idx) => (
                <AdminTr key={p.id}>
                  <AdminTitleCell
                    href={`/admin/lernpfade/${p.id}`}
                    title={p.title}
                  />
                  <AdminTd>
                    <StatusBadge status={p.status} />
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    {p.module_anzahl}
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    {p.lektion_anzahl}
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    {p.zugewiesen}
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {formatDatum(p.updated_at)}
                  </AdminTd>
                  <AdminTd align="right">
                    <div className="flex justify-end">
                      <ReihenfolgeButtons
                        hoch={lernpfadReihenfolge.bind(null, p.id, "hoch")}
                        runter={lernpfadReihenfolge.bind(null, p.id, "runter")}
                        hochDeaktiviert={idx === 0}
                        runterDeaktiviert={idx === pfade.length - 1}
                      />
                    </div>
                  </AdminTd>
                  <AdminTd align="right">
                    <Link
                      href={`/lernpfade/${p.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                      title="Vorschau"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </AdminTd>
                  <AdminActionCell href={`/admin/lernpfade/${p.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
