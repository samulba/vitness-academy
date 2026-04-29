import {
  ExternalLink,
  GraduationCap,
  Layers,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import {
  EmptyState,
  EmptyStateTablePreview,
} from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { createClient } from "@/lib/supabase/server";
import { bildUrlFuerPfad } from "@/lib/storage";
import { formatDatum } from "@/lib/format";

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

function PfadThumb({ pfad }: { pfad: Zeile }) {
  const url = bildUrlFuerPfad(pfad.hero_image_path);
  if (url) {
    return (
      <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.18)]"
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
  const moduleSumme = pfade.reduce((s, p) => s + p.module_anzahl, 0);
  const zuweisungenSumme = pfade.reduce((s, p) => s + p.zugewiesen, 0);

  const columns: Column<Zeile>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <PfadThumb pfad={p} />
          <span className="font-medium text-foreground">{p.title}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "module_anzahl",
      label: "Module",
      sortable: true,
      align: "right",
      render: (p) => <span className="tabular-nums">{p.module_anzahl}</span>,
    },
    {
      key: "lektion_anzahl",
      label: "Lektionen",
      sortable: true,
      align: "right",
      render: (p) => <span className="tabular-nums">{p.lektion_anzahl}</span>,
    },
    {
      key: "zugewiesen",
      label: "Zuweisungen",
      sortable: true,
      align: "right",
      render: (p) =>
        p.zugewiesen > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--brand-pink))]">
            {p.zugewiesen}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">0</span>
        ),
    },
    {
      key: "updated_at",
      label: "Aktualisiert",
      sortable: true,
      render: (p) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(p.updated_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inhalte"
        title="Lernpfade"
        description="Reihenfolge bestimmt die Anzeige im Mitarbeiter-Bereich."
        primaryAction={{
          label: "Neuer Lernpfad",
          icon: <Plus />,
          href: "/admin/lernpfade/neu",
        }}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Lernpfade"
          value={pfade.length}
          icon={<GraduationCap />}
        />
        <StatCard label="Module gesamt" value={moduleSumme} icon={<Layers />} />
        <StatCard
          label="Lektionen gesamt"
          value={lektionenSumme}
          icon={<Pencil />}
        />
        <StatCard
          label="Zuweisungen"
          value={zuweisungenSumme}
          icon={<Users />}
        />
      </StatGrid>

      {pfade.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Lernpfade"
            description="Lege deinen ersten Lernpfad an. Module und Lektionen baust du dann auf der Detailseite."
            actions={[
              {
                icon: <Plus />,
                title: "Lernpfad anlegen",
                description: "Mit Modulen und Lektionen",
                href: "/admin/lernpfade/neu",
              },
              {
                icon: <Layers />,
                title: "Inhalte aus Notion",
                description: "Markdown-Import via CLI",
                href: "/admin/wissen",
              },
              {
                icon: <Users />,
                title: "Mitarbeiter zuweisen",
                description: "Lernpfade zu Personen",
                href: "/admin/benutzer",
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<Zeile>
          data={pfade}
          columns={columns}
          searchable={{ placeholder: "Lernpfad suchen…", keys: ["title"] }}
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "aktiv", label: "Aktiv" },
                { value: "entwurf", label: "Entwurf" },
                { value: "archiviert", label: "Archiviert" },
              ],
              multi: true,
            },
          ]}
          rowHref={(p) => `/admin/lernpfade/${p.id}`}
          rowActions={[
            {
              icon: <ExternalLink />,
              label: "Vorschau",
              href: (p) => `/lernpfade/${p.id}`,
            },
            {
              icon: <Pencil />,
              label: "Bearbeiten",
              href: (p) => `/admin/lernpfade/${p.id}`,
            },
          ]}
          defaultSort={{ key: "title", direction: "asc" }}
        />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv === pfade.length
          ? "Alle Lernpfade sind aktiv und werden Mitarbeitern angezeigt."
          : `${aktiv} von ${pfade.length} aktiv.`}
      </p>
    </div>
  );
}
