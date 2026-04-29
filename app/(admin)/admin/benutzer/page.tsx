import { Plus, Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
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
import { FilterPills } from "@/components/admin/FilterPills";
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mitarbeiter"
        description="Rollen, Standorte und Lernpfad-Zuweisungen pflegst du über die Detailseite."
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

      <FilterPills
        items={[
          { href: "/admin/benutzer", label: "Aktive", aktiv: !showArchiv },
          {
            href: "/admin/benutzer?archiviert=1",
            label: "Auch archivierte",
            aktiv: showArchiv,
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
          description="Neue Mitarbeiter erhalten einen Magic-Link per E-Mail. Archivierte können sich nicht mehr einloggen."
        />
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
            {benutzer.length === 0 ? (
              <AdminTableEmpty colSpan={6}>
                Keine Benutzer gefunden.
              </AdminTableEmpty>
            ) : (
              benutzer.map((b) => (
                <AdminTr key={b.id} archiviert={Boolean(b.archived_at)}>
                  <AdminTitleCell
                    href={`/admin/benutzer/${b.id}`}
                    title={b.full_name ?? "—"}
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
                  <AdminTd align="right" className="tabular-nums">
                    {b.zugewiesen}
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {formatDatum(b.created_at)}
                  </AdminTd>
                  <AdminActionCell href={`/admin/benutzer/${b.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}

