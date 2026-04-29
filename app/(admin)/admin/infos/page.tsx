import Link from "next/link";
import { AlertTriangle, EyeOff, Pencil, Pin, Plus, Siren } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeAnnouncements } from "@/lib/infos";
import { formatDatum } from "@/lib/format";

export default async function InfosAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const infos = await ladeAnnouncements({ nurPublished: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Wichtige Infos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Mitteilungen die Mitarbeiter:innen unter Studio · Wichtige Infos
            sehen.
          </p>
        </div>
        <Link
          href="/admin/infos/neu"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Neue Info
        </Link>
      </header>

      {infos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Noch keine Infos angelegt.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {infos.map((i, idx) => (
            <li key={i.id} className={idx > 0 ? "border-t border-border" : ""}>
              <Link
                href={`/admin/infos/${i.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
              >
                <div className="flex shrink-0 gap-1.5">
                  {i.importance === "critical" && (
                    <Siren className="h-4 w-4 text-[hsl(var(--destructive))]" />
                  )}
                  {i.importance === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                  )}
                  {i.pinned && (
                    <Pin className="h-4 w-4 text-[hsl(var(--primary))]" />
                  )}
                  {!i.published && (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">
                    {i.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDatum(i.created_at)}
                    {i.author_name && <> · {i.author_name}</>}
                    {!i.published && <> · nur Admin sichtbar</>}
                  </p>
                </div>
                <Pencil className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[hsl(var(--primary))]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
