import Link from "next/link";
import { ArrowRight, Euro, FileText, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { formatDatum } from "@/lib/format";
import { aktuellerMonat, formatEuro, monatLabel } from "@/lib/lohn-types";

export const dynamic = "force-dynamic";

type RowMitArbeiter = {
  id: string;
  full_name: string | null;
  role: string;
  archived_at: string | null;
  letzteAbrechnung: { monat: string; hochgeladen_am: string } | null;
};

export default async function LohnAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();

  // Aktive Mitarbeiter laden
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, archived_at")
    .is("archived_at", null)
    .order("full_name", { ascending: true });

  // Letzte Lohnabrechnung pro User holen
  const { data: lohn } = await supabase
    .from("lohnabrechnungen")
    .select("user_id, monat, hochgeladen_am")
    .order("monat", { ascending: false });

  const letztePro = new Map<string, { monat: string; hochgeladen_am: string }>();
  for (const l of (lohn ?? []) as Array<{
    user_id: string;
    monat: string;
    hochgeladen_am: string;
  }>) {
    if (!letztePro.has(l.user_id)) {
      letztePro.set(l.user_id, { monat: l.monat, hochgeladen_am: l.hochgeladen_am });
    }
  }

  const rows: RowMitArbeiter[] = (
    (profiles ?? []) as Array<{
      id: string;
      full_name: string | null;
      role: string;
      archived_at: string | null;
    }>
  ).map((p) => ({
    ...p,
    letzteAbrechnung: letztePro.get(p.id) ?? null,
  }));

  const monat = aktuellerMonat();
  const fehlt = rows.filter((r) => r.letzteAbrechnung?.monat !== monat).length;
  const total = rows.length;
  const totalAbrechnungen = (lohn ?? []).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verwaltung"
        title="Lohnabrechnungen"
        description={`Pro Mitarbeiter monatlich PDF hochladen. ${monatLabel(monat)} steht für ${fehlt} von ${total} Mitarbeiter:innen aus.`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Mitarbeiter:innen aktiv" value={total} icon={<FileText />} />
        <Stat
          label={`${monatLabel(monat)} fehlt`}
          value={fehlt}
          icon={<Inbox />}
          tone={fehlt === 0 ? "success" : "warn"}
        />
        <Stat label="Hochgeladen gesamt" value={totalAbrechnungen} icon={<Euro />} />
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((r, i) => {
          const aktuellerVorhanden = r.letzteAbrechnung?.monat === monat;
          return (
            <li
              key={r.id}
              className={i > 0 ? "border-t border-border" : ""}
            >
              <Link
                href={`/admin/lohn/${r.id}`}
                className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:gap-5 sm:px-5"
              >
                <ColoredAvatar name={r.full_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {r.full_name ?? "—"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {r.letzteAbrechnung
                      ? `Letzte Abrechnung: ${monatLabel(r.letzteAbrechnung.monat)} (${formatDatum(r.letzteAbrechnung.hochgeladen_am)})`
                      : "Noch keine Abrechnung hochgeladen"}
                  </p>
                </div>
                <span
                  className={
                    aktuellerVorhanden
                      ? "hidden shrink-0 rounded-full bg-[hsl(var(--success)/0.15)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--success))] sm:inline-flex"
                      : "hidden shrink-0 rounded-full bg-[hsl(var(--brand-pink)/0.15)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))] sm:inline-flex"
                  }
                >
                  {aktuellerVorhanden ? "Aktuell" : "Fehlt"}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[hsl(var(--primary))]" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "success" | "warn";
}) {
  const v =
    tone === "success"
      ? "text-[hsl(var(--success))]"
      : tone === "warn"
        ? "text-[hsl(var(--brand-pink))]"
        : "";
  // formatEuro ist nicht needed here, kept import via type-import elsewhere
  void formatEuro;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className="[&_svg]:size-4">{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold leading-none tabular-nums ${v}`}>
        {value}
      </p>
    </div>
  );
}
