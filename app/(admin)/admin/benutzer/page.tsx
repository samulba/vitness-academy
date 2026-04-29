import {
  Activity,
  Plus,
  Sparkles,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { StatsStrip } from "@/components/admin/StatsStrip";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import {
  AdminActionCell,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTitleCell,
  AdminTr,
} from "@/components/admin/AdminTable";
import { FilterPills } from "@/components/admin/FilterPills";
import { EmptyState } from "@/components/admin/EmptyState";
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

  // Stats: gesamt aktive, neue diese Woche, mit Lernpfaden, Fuehrungskraefte+
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mitarbeiter"
        description="Rollen, Standorte und Lernpfad-Zuweisungen pflegst du über die Detailseite."
        badge={
          aktive > 0 ? (
            <StatusPill ton="primary" dot pulse>
              {aktive} aktiv
            </StatusPill>
          ) : null
        }
        actions={
          <>
            <AdminButton variant="secondary" href="/admin/benutzer/bulk-import">
              <Upload className="h-3.5 w-3.5" />
              CSV importieren
            </AdminButton>
            <AdminButton href="/admin/benutzer/neu">
              <Plus className="h-3.5 w-3.5" />
              Neue:r Mitarbeiter:in
            </AdminButton>
          </>
        }
      />

      <StatsStrip
        items={[
          {
            icon: <Users className="h-4 w-4" />,
            label: "Aktive Mitarbeiter",
            wert: aktive,
            akzent: true,
          },
          {
            icon: <UserPlus className="h-4 w-4" />,
            label: "Neu diese Woche",
            wert: neueDieseWoche,
            delta: neueDieseWoche > 0 ? `+${neueDieseWoche}` : undefined,
            hint: "letzte 7 Tage",
          },
          {
            icon: <Sparkles className="h-4 w-4" />,
            label: "Mit Lernpfaden",
            wert: `${mitPfaden}/${aktive}`,
            hint:
              aktive > 0
                ? `${Math.round((mitPfaden / aktive) * 100)} % zugewiesen`
                : undefined,
          },
          {
            icon: <Activity className="h-4 w-4" />,
            label: "Führung & Admin",
            wert: fuehrungAnzahl,
          },
        ]}
      />

      <FilterPills
        items={[
          {
            href: "/admin/benutzer",
            label: "Aktive",
            aktiv: !showArchiv,
            count: aktive,
          },
          {
            href: "/admin/benutzer?archiviert=1",
            label: "Auch archivierte",
            aktiv: showArchiv,
            count: showArchiv ? archiviert : undefined,
          },
        ]}
      />

      <AdminCard>
        <AdminCardHeader
          title={
            showArchiv
              ? `${aktive} aktiv · ${archiviert} archiviert`
              : `${aktive} aktive Mitarbeiter`
          }
          description="Neue Mitarbeiter erhalten einen Magic-Link per E-Mail."
        />
        {benutzer.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={
              showArchiv ? "Keine Mitarbeiter gefunden" : "Noch keine Mitarbeiter"
            }
            description="Lege jemanden über das Formular an oder importiere mehrere via CSV."
            ctaLabel="Mitarbeiter:in anlegen"
            ctaHref="/admin/benutzer/neu"
          />
        ) : (
          <AdminTable>
            <AdminTableHead>
              <AdminTh>Name</AdminTh>
              <AdminTh>Rolle</AdminTh>
              <AdminTh>Standort</AdminTh>
              <AdminTh align="right">Lernpfade</AdminTh>
              <AdminTh>Angelegt</AdminTh>
              <AdminTh align="right" />
            </AdminTableHead>
            <tbody>
              {benutzer.map((b) => (
                <AdminTr key={b.id} archiviert={Boolean(b.archived_at)}>
                  <AdminTitleCell
                    href={`/admin/benutzer/${b.id}`}
                    title={b.full_name ?? "—"}
                    leading={<ColoredAvatar name={b.full_name} size="md" />}
                    badge={
                      b.archived_at ? (
                        <StatusPill ton="neutral">archiviert</StatusPill>
                      ) : null
                    }
                  />
                  <AdminTd>
                    <RollenPill role={b.role} />
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {b.location_name ?? "—"}
                  </AdminTd>
                  <AdminTd align="right">
                    {b.zugewiesen > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--brand-pink))]">
                        {b.zugewiesen}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">0</span>
                    )}
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {formatDatum(b.created_at)}
                  </AdminTd>
                  <AdminActionCell href={`/admin/benutzer/${b.id}`} />
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
