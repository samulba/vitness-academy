import { MapPin, Plus, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  AdminActionCell,
  AdminTable,
  AdminTableEmpty,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/admin/AdminTable";
import { requireRole } from "@/lib/auth";
import { ladeStandorte } from "@/lib/standorte";

export default async function StandorteAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const standorte = await ladeStandorte();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Standorte"
        description="Studios, denen Mitarbeiter zugeordnet werden können."
        actions={
          <AdminButton href="/admin/standorte/neu">
            <Plus className="h-3.5 w-3.5" />
            Neuer Standort
          </AdminButton>
        }
      />

      <AdminCard>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Name</AdminTh>
            <AdminTh align="right">Mitarbeiter</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {standorte.length === 0 ? (
              <AdminTableEmpty colSpan={3}>
                Noch keine Standorte angelegt.
              </AdminTableEmpty>
            ) : (
              standorte.map((s) => (
                <AdminTr key={s.id}>
                  <AdminTd>
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <a
                        href={`/admin/standorte/${s.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {s.name}
                      </a>
                    </span>
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {s.mitarbeiter_count}
                    </span>
                  </AdminTd>
                  <AdminActionCell href={`/admin/standorte/${s.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
