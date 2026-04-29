import { Inbox, Plus } from "lucide-react";
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
import { ladeSubmissions, ladeTemplates } from "@/lib/formulare";

export default async function FormulareAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const [templates, offen] = await Promise.all([
    ladeTemplates(),
    ladeSubmissions({ status: ["eingereicht", "in_bearbeitung"] }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Formulare"
        description="Vorlagen pflegen, Einreichungen bearbeiten."
        actions={
          <>
            <AdminButton variant="secondary" href="/admin/formulare/eingaenge">
              <Inbox className="h-3.5 w-3.5" />
              Eingänge
              {offen.length > 0 && (
                <span className="ml-1 rounded-full bg-[hsl(var(--primary))] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[hsl(var(--primary-foreground))]">
                  {offen.length}
                </span>
              )}
            </AdminButton>
            <AdminButton href="/admin/formulare/neu">
              <Plus className="h-3.5 w-3.5" />
              Neues Formular
            </AdminButton>
          </>
        }
      />

      <AdminCard>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Titel</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh align="right">Felder</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {templates.length === 0 ? (
              <AdminTableEmpty colSpan={5}>
                Noch keine Formulare angelegt.
              </AdminTableEmpty>
            ) : (
              templates.map((t) => (
                <AdminTr key={t.id}>
                  <AdminTitleCell
                    href={`/admin/formulare/${t.id}`}
                    title={t.title}
                  />
                  <AdminTd className="font-mono text-xs text-muted-foreground">
                    /{t.slug}
                  </AdminTd>
                  <AdminTd>
                    {t.status === "aktiv" ? (
                      <StatusPill ton="success">Aktiv</StatusPill>
                    ) : t.status === "entwurf" ? (
                      <StatusPill ton="warn">Entwurf</StatusPill>
                    ) : (
                      <StatusPill ton="neutral">Archiviert</StatusPill>
                    )}
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    {t.fields.length}
                  </AdminTd>
                  <AdminActionCell href={`/admin/formulare/${t.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
