import {
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  Wrench,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireRole } from "@/lib/auth";
import { fotoUrlFuerPfad, ladeMaengel, type Mangel } from "@/lib/maengel";
import { formatDatum } from "@/lib/format";

function StatusBadge({ status }: { status: string }) {
  if (status === "offen")
    return (
      <StatusPill ton="warn" dot>
        Offen
      </StatusPill>
    );
  if (status === "in_bearbeitung")
    return (
      <StatusPill ton="info" dot>
        In Bearbeitung
      </StatusPill>
    );
  if (status === "behoben")
    return (
      <StatusPill ton="success" dot>
        Behoben
      </StatusPill>
    );
  return <StatusPill ton="neutral">Verworfen</StatusPill>;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "kritisch")
    return (
      <StatusPill ton="danger" dot pulse>
        Kritisch
      </StatusPill>
    );
  if (severity === "normal")
    return <StatusPill ton="warn">Normal</StatusPill>;
  return <StatusPill ton="neutral">Niedrig</StatusPill>;
}

export default async function MaengelAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const offen = await ladeMaengel({ status: ["offen", "in_bearbeitung"] });
  const erledigt = await ladeMaengel({ status: ["behoben", "verworfen"] });
  const inBearbeitung = offen.filter((m) => m.status === "in_bearbeitung").length;
  const kritisch = offen.filter((m) => m.severity === "kritisch").length;
  const behoben = erledigt.filter((m) => m.status === "behoben").length;

  const columns: Column<Mangel>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3">
          <MangelThumb m={m} />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{m.title}</span>
            {m.description && (
              <span className="line-clamp-1 text-[11px] text-muted-foreground">
                {m.description}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: "severity",
      label: "Schwere",
      sortable: true,
      render: (m) => <SeverityBadge severity={m.severity} />,
    },
    {
      key: "reported_by_name",
      label: "Gemeldet",
      render: (m) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(m.created_at)}
          {m.reported_by_name && (
            <span className="ml-1">· {m.reported_by_name}</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio-Daten"
        title="Mängel"
        description="Inbox aller gemeldeten Probleme. Klick öffnet die Details mit Status-Setzung."
      />

      <StatGrid cols={4}>
        <StatCard
          label="Aktuell offen"
          value={offen.length}
          icon={<AlertTriangle />}
        />
        <StatCard
          label="In Bearbeitung"
          value={inBearbeitung}
          icon={<Wrench />}
        />
        <StatCard
          label="Behoben gesamt"
          value={behoben}
          icon={<CheckCircle2 />}
        />
        <StatCard
          label="Gesamt erfasst"
          value={offen.length + erledigt.length}
          icon={<Zap />}
          trend={
            kritisch > 0
              ? { value: kritisch, direction: "down", hint: "kritisch offen" }
              : undefined
          }
        />
      </StatGrid>

      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Aktuell offen ({offen.length})
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Warten auf Bearbeitung oder sind in Arbeit.
          </p>
        </header>
        {offen.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="Keine offenen Mängel"
              description="Alle gemeldeten Probleme sind bearbeitet. Top Studio-Team!"
            />
          </div>
        ) : (
          <DataTable<Mangel>
            data={offen}
            columns={columns}
            searchable={{
              placeholder: "Mangel suchen…",
              keys: ["title", "description"],
            }}
            filters={[
              {
                key: "severity",
                label: "Schwere",
                options: [
                  { value: "kritisch", label: "Kritisch" },
                  { value: "normal", label: "Normal" },
                  { value: "niedrig", label: "Niedrig" },
                ],
                multi: true,
              },
              {
                key: "status",
                label: "Status",
                options: [
                  { value: "offen", label: "Offen" },
                  { value: "in_bearbeitung", label: "In Bearbeitung" },
                ],
                multi: true,
              },
            ]}
            rowHref={(m) => `/admin/maengel/${m.id}`}
            defaultSort={{ key: "reported_by_name", direction: "desc" }}
          />
        )}
      </section>

      {erledigt.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Erledigt
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Letzte 20 abgeschlossene Mängel.
            </p>
          </header>
          <DataTable<Mangel>
            data={erledigt.slice(0, 20)}
            columns={columns}
            rowHref={(m) => `/admin/maengel/${m.id}`}
            defaultSort={{ key: "reported_by_name", direction: "desc" }}
          />
        </section>
      )}
    </div>
  );
}

function MangelThumb({ m }: { m: Mangel }) {
  const url = fotoUrlFuerPfad(m.photo_path);
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-3.5 w-3.5" />
      )}
    </span>
  );
}
