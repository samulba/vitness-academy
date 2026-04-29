import { AlertTriangle, EyeOff, Pin, Plus, Siren } from "lucide-react";
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
import { ladeAnnouncements } from "@/lib/infos";
import { formatDatum } from "@/lib/format";

export default async function InfosAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const infos = await ladeAnnouncements({ nurPublished: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Wichtige Infos"
        description="Mitteilungen, die Mitarbeiter:innen unter Studio · Wichtige Infos sehen."
        actions={
          <AdminButton href="/admin/infos/neu">
            <Plus className="h-3.5 w-3.5" />
            Neue Info
          </AdminButton>
        }
      />

      <AdminCard>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Titel</AdminTh>
            <AdminTh>Wichtigkeit</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Veröffentlicht</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {infos.length === 0 ? (
              <AdminTableEmpty colSpan={5}>
                Noch keine Infos angelegt.
              </AdminTableEmpty>
            ) : (
              infos.map((i) => (
                <AdminTr key={i.id}>
                  <AdminTitleCell
                    href={`/admin/infos/${i.id}`}
                    title={i.title}
                    subtitle={i.author_name ?? undefined}
                    badge={
                      i.pinned ? (
                        <StatusPill ton="primary">
                          <Pin className="h-3 w-3" />
                          Angepinnt
                        </StatusPill>
                      ) : null
                    }
                  />
                  <AdminTd>
                    {i.importance === "critical" ? (
                      <StatusPill ton="danger">
                        <Siren className="h-3 w-3" />
                        Kritisch
                      </StatusPill>
                    ) : i.importance === "warning" ? (
                      <StatusPill ton="warn">
                        <AlertTriangle className="h-3 w-3" />
                        Warnung
                      </StatusPill>
                    ) : (
                      <StatusPill ton="info">Info</StatusPill>
                    )}
                  </AdminTd>
                  <AdminTd>
                    {i.published ? (
                      <StatusPill ton="success">Veröffentlicht</StatusPill>
                    ) : (
                      <StatusPill ton="neutral">
                        <EyeOff className="h-3 w-3" />
                        Entwurf
                      </StatusPill>
                    )}
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {formatDatum(i.created_at)}
                  </AdminTd>
                  <AdminActionCell href={`/admin/infos/${i.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
