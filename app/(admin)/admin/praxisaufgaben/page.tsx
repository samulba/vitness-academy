import Link from "next/link";
import { CheckSquare, Clock, Pencil, Plus, ThumbsDown, ThumbsUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { createClient } from "@/lib/supabase/server";
import { alsArray, istNextJsControlFlow, joinTitel } from "@/lib/admin/safe-loader";

type Zeile = {
  id: string;
  title: string;
  status: string;
  pfad_titel: string | null;
  lektion_titel: string | null;
  bereit: number;
  freigegeben: number;
  abgelehnt: number;
  updated_at: string;
};

async function ladeAufgaben(): Promise<Zeile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("practical_tasks")
      .select(
        `id, title, status, updated_at, sort_order,
         learning_paths:learning_path_id ( title ),
         lessons:lesson_id ( title ),
         user_practical_signoffs ( status )`,
      )
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[ladeAufgaben] supabase error:", error);
      return [];
    }

    type Roh = {
      id?: string;
      title?: string;
      status?: string;
      updated_at?: string;
      learning_paths?: unknown;
      lessons?: unknown;
      user_practical_signoffs?: unknown;
    };

    return ((data ?? []) as unknown as Roh[])
      .filter((t) => typeof t.id === "string" && typeof t.title === "string")
      .map((t) => {
        const sos = alsArray<{ status?: string }>(t.user_practical_signoffs);
        return {
          id: t.id as string,
          title: t.title as string,
          status: typeof t.status === "string" ? t.status : "aktiv",
          pfad_titel: joinTitel(t.learning_paths),
          lektion_titel: joinTitel(t.lessons),
          bereit: sos.filter((s) => s?.status === "bereit").length,
          freigegeben: sos.filter((s) => s?.status === "freigegeben").length,
          abgelehnt: sos.filter((s) => s?.status === "abgelehnt").length,
          updated_at:
            typeof t.updated_at === "string"
              ? t.updated_at
              : new Date().toISOString(),
        };
      });
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeAufgaben] unexpected error:", e);
    return [];
  }
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

export default async function AdminPraxisaufgabenPage() {
  const aufgaben = await ladeAufgaben();
  const aktiv = aufgaben.filter((a) => a.status === "aktiv").length;
  const wartetSumme = aufgaben.reduce((s, a) => s + a.bereit, 0);
  const freigegebenSumme = aufgaben.reduce((s, a) => s + a.freigegeben, 0);
  const abgelehntSumme = aufgaben.reduce((s, a) => s + a.abgelehnt, 0);

  const columns: Column<Zeile>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (a) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{a.title}</span>
          {(a.pfad_titel || a.lektion_titel) && (
            <span className="text-[11px] text-muted-foreground">
              {[a.pfad_titel, a.lektion_titel].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "bereit",
      label: "Wartet",
      sortable: true,
      align: "right",
      render: (a) => (
        <span className="tabular-nums text-[hsl(var(--brand-pink))]">
          {a.bereit}
        </span>
      ),
    },
    {
      key: "freigegeben",
      label: "Freigegeben",
      sortable: true,
      align: "right",
      render: (a) => (
        <span className="tabular-nums text-[hsl(var(--success))]">
          {a.freigegeben}
        </span>
      ),
    },
    {
      key: "abgelehnt",
      label: "Abgelehnt",
      sortable: true,
      align: "right",
      render: (a) => (
        <span className="tabular-nums text-muted-foreground">
          {a.abgelehnt}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inhalte"
        title="Praxisaufgaben"
        description="Vorlagen für Praxisfreigaben. Anfragen freigeben/ablehnen findest du unter Studio-Daten · Anfragen."
        primaryAction={{
          label: "Neue Aufgabe",
          icon: <Plus />,
          href: "/admin/praxisaufgaben/neu",
        }}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Aufgaben gesamt"
          value={aufgaben.length}
          icon={<CheckSquare />}
        />
        <StatCard label="Wartet auf Freigabe" value={wartetSumme} icon={<Clock />} />
        <StatCard label="Freigegeben" value={freigegebenSumme} icon={<ThumbsUp />} />
        <StatCard label="Abgelehnt" value={abgelehntSumme} icon={<ThumbsDown />} />
      </StatGrid>

      {aufgaben.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Praxisaufgaben"
            description="Lege eine erste Praxisaufgabe an, die Mitarbeiter aktiv abschließen müssen."
            actions={[
              {
                icon: <Plus />,
                title: "Aufgabe anlegen",
                description: "Pfad/Lektion verknüpfen",
                href: "/admin/praxisaufgaben/neu",
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<Zeile>
          data={aufgaben}
          columns={columns}
          searchable={{ placeholder: "Aufgabe suchen…", keys: ["title"] }}
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
          rowHref={(a) => `/admin/praxisaufgaben/${a.id}`}
          rowActions={[
            {
              icon: <Pencil />,
              label: "Bearbeiten",
              href: (a) => `/admin/praxisaufgaben/${a.id}`,
            },
          ]}
          defaultSort={{ key: "title", direction: "asc" }}
        />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv} aktiv. Tipp: Mitarbeiter-Anfragen findest du unter{" "}
        <Link
          href="/admin/praxisfreigaben"
          className="font-medium text-foreground hover:underline"
        >
          Studio-Daten · Anfragen
        </Link>
        .
      </p>
    </div>
  );
}
