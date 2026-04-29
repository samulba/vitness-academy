import { CheckCircle2, Plus, RotateCw, Users } from "lucide-react";
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
import { requireRole } from "@/lib/auth";
import { ladeAlleAufgabenAdmin } from "@/lib/aufgaben";

export default async function AufgabenAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const alle = await ladeAlleAufgabenAdmin();
  const templates = alle.filter((a) => a.recurrence !== "none");
  const instances = alle.filter((a) => a.recurrence === "none");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Aufgaben"
        description="Tägliche ToDo's, einmalige Aufgaben und wiederkehrende Templates."
        actions={
          <AdminButton href="/admin/aufgaben/neu">
            <Plus className="h-3.5 w-3.5" />
            Neue Aufgabe
          </AdminButton>
        }
      />

      {templates.length > 0 && (
        <AdminCard>
          <AdminCardHeader
            title="Wiederholende Templates"
            description="Generieren beim ersten Login des Tages bzw. der Woche eine neue Instance."
          />
          <AdminTable>
            <AdminTableHead>
              <AdminTh>Titel</AdminTh>
              <AdminTh>Rhythmus</AdminTh>
              <AdminTh>Empfänger</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh align="right" />
            </AdminTableHead>
            <tbody>
              {templates.map((a) => (
                <AdminTr key={a.id}>
                  <AdminTd>
                    <a
                      href={`/admin/aufgaben/${a.id}`}
                      className="flex items-center gap-2.5"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                        <RotateCw className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-medium hover:underline">
                        {a.title}
                      </span>
                    </a>
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {a.recurrence === "daily" ? "Täglich" : "Wöchentlich"}
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {a.assigned_to_name ?? "Team"}
                  </AdminTd>
                  <AdminTd>
                    {a.active ? (
                      <StatusPill ton="success">Aktiv</StatusPill>
                    ) : (
                      <StatusPill ton="neutral">Inaktiv</StatusPill>
                    )}
                  </AdminTd>
                  <AdminActionCell href={`/admin/aufgaben/${a.id}`} />
                </AdminTr>
              ))}
            </tbody>
          </AdminTable>
        </AdminCard>
      )}

      <AdminCard>
        <AdminCardHeader
          title={`Einzelne Aufgaben (${instances.length})`}
          description="Einmalige Tasks und automatisch generierte Instances."
        />
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Titel</AdminTh>
            <AdminTh>Empfänger</AdminTh>
            <AdminTh>Fällig</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {instances.length === 0 ? (
              <AdminTableEmpty colSpan={5}>
                Noch keine Aufgaben.
              </AdminTableEmpty>
            ) : (
              instances.map((a) => (
                <AdminTr key={a.id}>
                  <AdminTitleCell
                    href={`/admin/aufgaben/${a.id}`}
                    title={a.title}
                  />
                  <AdminTd className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {!a.assigned_to && <Users className="h-3 w-3" />}
                      {a.assigned_to_name ?? "Team"}
                    </span>
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {a.due_date ?? "—"}
                  </AdminTd>
                  <AdminTd>
                    {a.completed_at ? (
                      <StatusPill ton="success">
                        <CheckCircle2 className="h-3 w-3" />
                        Erledigt
                      </StatusPill>
                    ) : (
                      <StatusPill ton="warn">Offen</StatusPill>
                    )}
                  </AdminTd>
                  <AdminActionCell href={`/admin/aufgaben/${a.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
