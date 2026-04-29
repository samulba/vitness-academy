import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { StatsStrip } from "@/components/admin/StatsStrip";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  AdminActionCell,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTitleCell,
  AdminTr,
} from "@/components/admin/AdminTable";
import { createClient } from "@/lib/supabase/server";
import { bildUrlFuerPfad } from "@/lib/storage";
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
  hero_image_path: string | null;
};

async function ladeLernpfade(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select(
      `id, title, status, updated_at, sort_order, hero_image_path,
       modules ( id, lessons ( id ) ),
       user_learning_path_assignments ( id )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    hero_image_path: string | null;
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
    hero_image_path: p.hero_image_path,
  }));
}

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv")
    return (
      <StatusPill ton="success" dot>
        Aktiv
      </StatusPill>
    );
  if (status === "entwurf") return <StatusPill ton="warn">Entwurf</StatusPill>;
  return <StatusPill ton="neutral">Archiviert</StatusPill>;
}

/** Mini-Hero-Thumbnail fuer die Tabellen-Zeile */
function PfadThumb({
  pfad,
}: {
  pfad: { hero_image_path: string | null; title: string };
}) {
  const url = bildUrlFuerPfad(pfad.hero_image_path);
  if (url) {
    return (
      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  // Fallback-Tile mit Magenta-Verlauf
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)]"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--brand-pink)) 100%)",
      }}
    >
      <GraduationCap className="h-4 w-4" />
    </span>
  );
}

export default async function AdminLernpfadeListe() {
  const pfade = await ladeLernpfade();
  const aktiv = pfade.filter((p) => p.status === "aktiv").length;
  const lektionenSumme = pfade.reduce((s, p) => s + p.lektion_anzahl, 0);
  const zuweisungenSumme = pfade.reduce((s, p) => s + p.zugewiesen, 0);
  const avgLektionen =
    pfade.length === 0 ? 0 : Math.round(lektionenSumme / pfade.length);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Lernpfade"
        description="Reihenfolge bestimmt die Anzeige im Mitarbeiter-Bereich."
        badge={
          aktiv > 0 ? (
            <StatusPill ton="success" dot>
              {aktiv} aktiv
            </StatusPill>
          ) : null
        }
        actions={
          <AdminButton href="/admin/lernpfade/neu">
            <Plus className="h-3.5 w-3.5" />
            Neuer Lernpfad
          </AdminButton>
        }
      />

      <StatsStrip
        items={[
          {
            icon: <GraduationCap className="h-4 w-4" />,
            label: "Lernpfade",
            wert: pfade.length,
            akzent: true,
            hint: aktiv === pfade.length ? "alle aktiv" : `${aktiv} aktiv`,
          },
          {
            icon: <Layers className="h-4 w-4" />,
            label: "Lektionen gesamt",
            wert: lektionenSumme,
            hint:
              avgLektionen > 0
                ? `Ø ${avgLektionen} pro Pfad`
                : undefined,
          },
          {
            icon: <BookOpen className="h-4 w-4" />,
            label: "Module gesamt",
            wert: pfade.reduce((s, p) => s + p.module_anzahl, 0),
          },
          {
            icon: <Users className="h-4 w-4" />,
            label: "Zuweisungen",
            wert: zuweisungenSumme,
            hint: "über alle Mitarbeiter",
          },
        ]}
      />

      <AdminCard>
        {pfade.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="h-6 w-6" />}
            title="Noch keine Lernpfade"
            description="Lege deinen ersten Lernpfad an. Module und Lektionen baust du dann auf der Detailseite."
            ctaLabel="Lernpfad anlegen"
            ctaHref="/admin/lernpfade/neu"
          />
        ) : (
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
              {pfade.map((p, idx) => (
                <AdminTr key={p.id}>
                  <AdminTitleCell
                    href={`/admin/lernpfade/${p.id}`}
                    title={p.title}
                    leading={<PfadThumb pfad={p} />}
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
                  <AdminTd align="right">
                    {p.zugewiesen > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--brand-pink))]">
                        {p.zugewiesen}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">0</span>
                    )}
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
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
