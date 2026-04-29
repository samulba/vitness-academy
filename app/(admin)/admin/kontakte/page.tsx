import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeKontakte, vollerName } from "@/lib/kontakte";

export default async function KontakteAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const kontakte = await ladeKontakte();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Kontakte</h1>
          <p className="mt-1 text-muted-foreground">
            Studio-interne Kontaktliste — Mitarbeiter:innen sehen sie unter
            Studio · Kontakte.
          </p>
        </div>
        <Link
          href="/admin/kontakte/neu"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Neuer Kontakt
        </Link>
      </header>

      {kontakte.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Noch keine Kontakte angelegt.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {kontakte.map((k, i) => (
            <li key={k.id} className={i > 0 ? "border-t border-border" : ""}>
              <Link
                href={`/admin/kontakte/${k.id}`}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">
                    {vollerName(k)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[k.email, k.phone].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="hidden flex-wrap gap-1 sm:flex">
                  {k.role_tags.slice(0, 3).map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]"
                    >
                      {r}
                    </span>
                  ))}
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
