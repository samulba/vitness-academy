import {
  Activity,
  Pencil,
  Plus,
  Sparkles,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { createClient } from "@/lib/supabase/server";
import { formatDatum } from "@/lib/format";

type Zeile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
  location_name: string | null;
  zugewiesen: number;
  archived_at: string | null;
};

async function ladeBenutzer(includeArchiviert: boolean): Promise<Zeile[]> {
  const supabase = await createClient();
  let q = supabase
    .from("profiles")
    .select(
      `id, full_name, role, created_at, archived_at,
       locations:location_id ( name ),
       user_learning_path_assignments ( id )`,
    )
    .order("created_at", { ascending: false });
  if (!includeArchiviert) q = q.is("archived_at", null);
  const { data } = await q;

  type Roh = {
    id: string;
    full_name: string | null;
    role: string;
    created_at: string;
    archived_at: string | null;
    locations: { name: string } | null;
    user_learning_path_assignments: { id: string }[] | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    role: r.role,
    created_at: r.created_at,
    archived_at: r.archived_at,
    location_name: r.locations?.name ?? null,
    zugewiesen: (r.user_learning_path_assignments ?? []).length,
  }));
}

function RollenPill({ role }: { role: string }) {
  if (role === "mitarbeiter")
    return <StatusPill ton="neutral">Mitarbeiter</StatusPill>;
  if (role === "fuehrungskraft")
    return <StatusPill ton="info">Führungskraft</StatusPill>;
  if (role === "admin") return <StatusPill ton="primary">Admin</StatusPill>;
  return <StatusPill ton="primary">Superadmin</StatusPill>;
}

export default async function AdminBenutzerListe({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const archivPrm = sp.archiviert;
  const showArchiv = archivPrm === "1" || archivPrm === "true";
  const benutzer = await ladeBenutzer(showArchiv);
  const aktive = benutzer.filter((b) => !b.archived_at).length;
  const archiviert = benutzer.filter((b) => b.archived_at).length;

  const wocheGrenze = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const neueDieseWoche = benutzer.filter(
    (b) => !b.archived_at && new Date(b.created_at) >= wocheGrenze,
  ).length;
  const mitPfaden = benutzer.filter(
    (b) => !b.archived_at && b.zugewiesen > 0,
  ).length;
  const fuehrungAnzahl = benutzer.filter(
    (b) =>
      !b.archived_at &&
      ["fuehrungskraft", "admin", "superadmin"].includes(b.role),
  ).length;

  const columns: Column<Zeile>[] = [
    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-3">
          <ColoredAvatar name={b.full_name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {b.full_name ?? "—"}
            </span>
            {b.archived_at && (
              <span className="text-[11px] text-muted-foreground">
                archiviert seit {formatDatum(b.archived_at)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rolle",
      sortable: true,
      render: (b) => <RollenPill role={b.role} />,
    },
    {
      key: "location_name",
      label: "Standort",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-muted-foreground">
          {b.location_name ?? "—"}
        </span>
      ),
    },
    {
      key: "zugewiesen",
      label: "Lernpfade",
      sortable: true,
      align: "right",
      render: (b) =>
        b.zugewiesen > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--brand-pink))]">
            {b.zugewiesen}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">0</span>
        ),
    },
    {
      key: "created_at",
      label: "Angelegt",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(b.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mitarbeiter"
        title="Mitarbeiter"
        description="Rollen, Standorte und Lernpfad-Zuweisungen pflegst du über die Detailseite."
        primaryAction={{
          label: "Neue:r Mitarbeiter:in",
          icon: <Plus />,
          href: "/admin/benutzer/neu",
        }}
        secondaryActions={[
          {
            icon: <Upload />,
            label: "CSV importieren",
            href: "/admin/benutzer/bulk-import",
          },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Aktive Mitarbeiter"
          value={aktive}
          icon={<Users />}
        />
        <StatCard
          label="Neu diese Woche"
          value={neueDieseWoche}
          icon={<UserPlus />}
          trend={
            neueDieseWoche > 0
              ? { value: neueDieseWoche, direction: "up", hint: "letzte 7 Tage" }
              : undefined
          }
        />
        <StatCard
          label="Mit Lernpfaden"
          value={`${mitPfaden}/${aktive}`}
          icon={<Sparkles />}
        />
        <StatCard
          label="Führung & Admin"
          value={fuehrungAnzahl}
          icon={<Activity />}
        />
      </StatGrid>

      {benutzer.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title={
              showArchiv ? "Keine Mitarbeiter gefunden" : "Noch keine Mitarbeiter"
            }
            description="Lege jemanden manuell an oder importiere mehrere via CSV. Der erste Mitarbeiter erhält sofort einen Magic-Link per E-Mail."
            actions={[
              {
                icon: <Plus />,
                title: "Mitarbeiter:in anlegen",
                description: "Magic-Link per E-Mail",
                href: "/admin/benutzer/neu",
              },
              {
                icon: <Upload />,
                title: "CSV importieren",
                description: "Mehrere in einem Rutsch",
                href: "/admin/benutzer/bulk-import",
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<Zeile>
          data={benutzer}
          columns={columns}
          searchable={{
            placeholder: "Mitarbeiter suchen…",
            keys: ["full_name", "location_name"],
          }}
          filters={[
            {
              key: "role",
              label: "Rolle",
              options: [
                { value: "mitarbeiter", label: "Mitarbeiter" },
                { value: "fuehrungskraft", label: "Führungskraft" },
                { value: "admin", label: "Admin" },
                { value: "superadmin", label: "Superadmin" },
              ],
              multi: true,
            },
          ]}
          rowHref={(b) => `/admin/benutzer/${b.id}`}
          rowActions={[
            {
              icon: <Pencil />,
              label: "Bearbeiten",
              href: (b) => `/admin/benutzer/${b.id}`,
            },
          ]}
          defaultSort={{ key: "created_at", direction: "desc" }}
        />
      )}

      <p className="text-[11px] text-muted-foreground">
        {showArchiv
          ? `${aktive} aktiv · ${archiviert} archiviert`
          : `${aktive} aktive Mitarbeiter`}
        {!showArchiv && archiviert === 0 && benutzer.length === 0 ? null : (
          <>
            {" · "}
            <a
              href={
                showArchiv ? "/admin/benutzer" : "/admin/benutzer?archiviert=1"
              }
              className="underline-offset-2 hover:underline"
            >
              {showArchiv ? "Nur aktive" : "Auch archivierte zeigen"}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
