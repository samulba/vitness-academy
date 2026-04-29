import { Plus } from "lucide-react";
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
import { requireRole } from "@/lib/auth";
import { ladeKontakte, vollerName } from "@/lib/kontakte";

export default async function KontakteAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const kontakte = await ladeKontakte();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kontakte"
        description="Studio-interne Kontaktliste — Mitarbeiter:innen sehen sie unter Studio · Kontakte."
        actions={
          <AdminButton href="/admin/kontakte/neu">
            <Plus className="h-3.5 w-3.5" />
            Neuer Kontakt
          </AdminButton>
        }
      />

      <AdminCard>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Name</AdminTh>
            <AdminTh>Kontakt</AdminTh>
            <AdminTh>Rollen</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {kontakte.length === 0 ? (
              <AdminTableEmpty colSpan={4}>
                Noch keine Kontakte angelegt.
              </AdminTableEmpty>
            ) : (
              kontakte.map((k) => (
                <AdminTr key={k.id}>
                  <AdminTitleCell
                    href={`/admin/kontakte/${k.id}`}
                    title={vollerName(k)}
                  />
                  <AdminTd className="text-xs text-muted-foreground">
                    {[k.email, k.phone].filter(Boolean).join(" · ") || "—"}
                  </AdminTd>
                  <AdminTd>
                    <div className="flex flex-wrap gap-1">
                      {k.role_tags.slice(0, 3).map((r) => (
                        <StatusPill key={r} ton="primary">
                          {r}
                        </StatusPill>
                      ))}
                      {k.role_tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{k.role_tags.length - 3}
                        </span>
                      )}
                    </div>
                  </AdminTd>
                  <AdminActionCell href={`/admin/kontakte/${k.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
