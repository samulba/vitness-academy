import Link from "next/link";
import { Pencil, Plus, RotateCw, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeAlleAufgabenAdmin } from "@/lib/aufgaben";

export default async function AufgabenAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const alle = await ladeAlleAufgabenAdmin();
  const templates = alle.filter((a) => a.recurrence !== "none");
  const instances = alle.filter((a) => a.recurrence === "none");

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Aufgaben</h1>
          <p className="mt-1 text-muted-foreground">
            Tägliche ToDo&apos;s, einmalige Aufgaben und wiederkehrende
            Templates.
          </p>
        </div>
        <Link
          href="/admin/aufgaben/neu"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Neue Aufgabe
        </Link>
      </header>

      {templates.length > 0 && (
        <Section
          titel="Wiederholende Templates"
          beschreibung="Generieren beim ersten Login des Tages bzw. der Woche eine neue Instance."
        >
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {templates.map((a, i) => (
              <li key={a.id} className={i > 0 ? "border-t border-border" : ""}>
                <Link
                  href={`/admin/aufgaben/${a.id}`}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
                >
                  <RotateCw className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold leading-tight">
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.recurrence === "daily" ? "Täglich" : "Wöchentlich"} ·{" "}
                      {a.assigned_to_name ?? "Team"}
                      {!a.active && <> · inaktiv</>}
                    </p>
                  </div>
                  <Pencil className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[hsl(var(--primary))]" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        titel="Einzelne Aufgaben"
        beschreibung="Einmalige Tasks und automatisch generierte Instances."
      >
        {instances.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Noch keine Aufgaben.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {instances.map((a, i) => (
              <li key={a.id} className={i > 0 ? "border-t border-border" : ""}>
                <Link
                  href={`/admin/aufgaben/${a.id}`}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                    {a.assigned_to ? (
                      <Pencil className="h-3.5 w-3.5" />
                    ) : (
                      <Users className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        a.completed_at
                          ? "truncate font-semibold leading-tight line-through opacity-60"
                          : "truncate font-semibold leading-tight"
                      }
                    >
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.assigned_to_name ?? "Team"}
                      {a.due_date && <> · fällig {a.due_date}</>}
                      {a.completed_at && a.completed_by_name && (
                        <> · ✓ {a.completed_by_name}</>
                      )}
                    </p>
                  </div>
                  <Pencil className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[hsl(var(--primary))]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({
  titel,
  beschreibung,
  children,
}: {
  titel: string;
  beschreibung: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{titel}</h2>
        <p className="text-sm text-muted-foreground">{beschreibung}</p>
      </div>
      {children}
    </section>
  );
}
