import { ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { StatusPill } from "@/components/admin/StatusPill";
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
import { fotoUrlFuerPfad, ladeMaengel, type Mangel } from "@/lib/maengel";
import { formatDatum } from "@/lib/format";

function StatusBadge({ status }: { status: string }) {
  if (status === "offen") return <StatusPill ton="warn">Offen</StatusPill>;
  if (status === "in_bearbeitung")
    return <StatusPill ton="info">In Bearbeitung</StatusPill>;
  if (status === "behoben")
    return <StatusPill ton="success">Behoben</StatusPill>;
  return <StatusPill ton="neutral">Verworfen</StatusPill>;
}

function SeverityDot({ severity }: { severity: string }) {
  const color =
    severity === "kritisch"
      ? "bg-destructive"
      : severity === "normal"
        ? "bg-amber-500"
        : "bg-muted-foreground/40";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
}

export default async function MaengelAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const offen = await ladeMaengel({ status: ["offen", "in_bearbeitung"] });
  const erledigt = await ladeMaengel({ status: ["behoben", "verworfen"] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mängel im Studio"
        description="Inbox aller gemeldeten Probleme. Klick öffnet die Details mit Status-Setzung."
      />

      <AdminCard>
        <AdminCardHeader title={`Aktuell offen (${offen.length})`} />
        {offen.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Keine offenen Mängel — top!
          </div>
        ) : (
          <AdminTable>
            <AdminTableHead>
              <AdminTh>Titel</AdminTh>
              <AdminTh>Foto</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Schwere</AdminTh>
              <AdminTh>Gemeldet</AdminTh>
              <AdminTh align="right" />
            </AdminTableHead>
            <tbody>
              {offen.map((m) => (
                <MangelZeile key={m.id} m={m} />
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCard>

      {erledigt.length > 0 && (
        <AdminCard>
          <AdminCardHeader
            title={`Erledigt (${Math.min(20, erledigt.length)})`}
            description="Letzte 20 abgeschlossene Mängel."
          />
          <AdminTable>
            <AdminTableHead>
              <AdminTh>Titel</AdminTh>
              <AdminTh>Foto</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Schwere</AdminTh>
              <AdminTh>Gemeldet</AdminTh>
              <AdminTh align="right" />
            </AdminTableHead>
            <tbody>
              {erledigt.length === 0 ? (
                <AdminTableEmpty colSpan={6}>
                  Keine Eintraege.
                </AdminTableEmpty>
              ) : (
                erledigt.slice(0, 20).map((m) => (
                  <MangelZeile key={m.id} m={m} />
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminCard>
      )}
    </div>
  );
}

function MangelZeile({ m }: { m: Mangel }) {
  const url = fotoUrlFuerPfad(m.photo_path);
  return (
    <AdminTr>
      <AdminTd>
        <a
          href={`/admin/maengel/${m.id}`}
          className="-mx-1 -my-1 inline-flex flex-col gap-0.5 px-1 py-1"
        >
          <span className="font-medium text-foreground hover:underline">
            {m.title}
          </span>
          {m.description && (
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {m.description}
            </span>
          )}
        </a>
      </AdminTd>
      <AdminTd>
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </AdminTd>
      <AdminTd>
        <StatusBadge status={m.status} />
      </AdminTd>
      <AdminTd>
        <span className="inline-flex items-center gap-1.5">
          <SeverityDot severity={m.severity} />
          <span className="text-xs capitalize text-muted-foreground">
            {m.severity}
          </span>
        </span>
      </AdminTd>
      <AdminTd className="text-xs text-muted-foreground">
        {formatDatum(m.created_at)}
        {m.reported_by_name && (
          <span className="ml-1">· {m.reported_by_name}</span>
        )}
      </AdminTd>
      <AdminActionCell href={`/admin/maengel/${m.id}`} />
    </AdminTr>
  );
}
