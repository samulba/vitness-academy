import Link from "next/link";
import { ArrowRight, Plus, Shield, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/admin/StatusPill";
import { requirePermission } from "@/lib/auth";
import { ladeRollen, type RolleVoll } from "@/lib/rollen-verwaltung";
import { MODUL_LABELS } from "@/lib/permissions";

export default async function RollenPage() {
  await requirePermission("rollen", "view");
  const rollen = await ladeRollen();

  const system = rollen.filter((r) => r.is_system);
  const custom = rollen.filter((r) => !r.is_system);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Stammdaten"
        title="Rollen & Rechte"
        description='System-Rollen sind fest. Lege bei Bedarf eigene Custom-Rollen an — z.B. "Reinigungs-Manager" der nur Putzprotokolle bearbeiten darf.'
        primaryAction={{
          label: "Neue Rolle",
          icon: <Plus />,
          href: "/admin/rollen/neu",
        }}
      />

      {/* System-Rollen */}
      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
          System-Rollen
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Werden vom System gepflegt. Permissions können bearbeitet
          werden, Name und Basis-Level sind fest.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {system.map((r) => (
            <li key={r.id}>
              <RolleCard rolle={r} />
            </li>
          ))}
        </ul>
      </section>

      {/* Custom-Rollen */}
      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Custom-Rollen
        </h2>
        {custom.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Shield className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">
              Noch keine Custom-Rollen angelegt
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Lege z.B. eine Rolle für deinen Reinigungs-Manager oder
              Vertriebs-Lead an.
            </p>
            <Link
              href="/admin/rollen/neu"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Rolle anlegen
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {custom.map((r) => (
              <li key={r.id}>
                <RolleCard rolle={r} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RolleCard({ rolle }: { rolle: RolleVoll }) {
  // Kurz-Summary der Permissions: max. 4 Module, dann "+ N weitere"
  const moduleSet = new Set(rolle.permissions.map((p) => p.modul));
  const moduleListe = Array.from(moduleSet).slice(0, 4);
  const rest = moduleSet.size - moduleListe.length;

  return (
    <Link
      href={`/admin/rollen/${rolle.id}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.45)] hover:shadow-[0_12px_32px_-16px_hsl(var(--primary)/0.25)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold leading-tight">
              {rolle.name}
            </h3>
            {rolle.is_system ? (
              <StatusPill ton="info">System</StatusPill>
            ) : (
              <StatusPill ton="primary">Custom</StatusPill>
            )}
          </div>
          {rolle.beschreibung && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {rolle.beschreibung}
            </p>
          )}
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-[hsl(var(--brand-pink)/0.08)] text-[hsl(var(--brand-pink))]">
          {rolle.is_system ? (
            <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Shield className="h-4 w-4" strokeWidth={1.75} />
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {moduleListe.length === 0 ? (
          <span className="text-[11px] text-muted-foreground italic">
            Keine Permissions
          </span>
        ) : (
          moduleListe.map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {MODUL_LABELS[m]}
            </span>
          ))
        )}
        {rest > 0 && (
          <span className="text-[10px] text-muted-foreground">
            + {rest} weitere
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="font-mono tabular-nums">
            {rolle.permissions.length}
          </span>
          <span>Permissions</span>
        </span>
        {rolle.user_count !== null && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="font-mono tabular-nums">{rolle.user_count}</span>
            <span>{rolle.user_count === 1 ? "Mitarbeiter" : "Mitarbeiter"}</span>
          </span>
        )}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
