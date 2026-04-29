import Link from "next/link";
import { Inbox, Pencil, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeSubmissions, ladeTemplates } from "@/lib/formulare";

export default async function FormulareAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const [templates, offen] = await Promise.all([
    ladeTemplates(),
    ladeSubmissions({ status: ["eingereicht", "in_bearbeitung"] }),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Formulare</h1>
          <p className="mt-1 text-muted-foreground">
            Vorlagen pflegen + Einreichungen bearbeiten.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/formulare/eingaenge"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Inbox className="h-4 w-4" />
            Eingänge
            {offen.length > 0 && (
              <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-foreground))]">
                {offen.length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/formulare/neu"
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Neues Formular
          </Link>
        </div>
      </header>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Noch keine Formulare angelegt. Klick oben rechts auf „Neues
          Formular“, um eins zu bauen.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {templates.map((t, i) => (
            <li key={t.id} className={i > 0 ? "border-t border-border" : ""}>
              <Link
                href={`/admin/formulare/${t.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="truncate font-semibold leading-tight">
                      {t.title}
                    </p>
                    {t.status === "entwurf" && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Entwurf
                      </span>
                    )}
                    {t.status === "archiviert" && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Archiviert
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    /{t.slug} · {t.fields.length}{" "}
                    {t.fields.length === 1 ? "Feld" : "Felder"}
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
