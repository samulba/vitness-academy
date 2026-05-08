import Link from "next/link";
import { Camera, CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAktiverStandort } from "@/lib/standort-context";
import { ladeProtokolleListe } from "@/lib/putzprotokoll";
import { formatDatum } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/admin/StatusPill";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { PutzprotokolleNav } from "@/components/admin/PutzprotokolleNav";

export const dynamic = "force-dynamic";

export default async function PutzprotokolleAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const aktiv = await getAktiverStandort();

  // Alle Protokolle der letzten 30 Tage fuer den aktiven Standort
  const today = new Date();
  const vor30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const vonDatum = vor30.toISOString().slice(0, 10);

  const protokolle = await ladeProtokolleListe({
    locationId: aktiv?.id ?? null,
    vonDatum,
    limit: 60,
  });

  // Stats: letzte 7 Tage, wieviele eingereicht?
  const letzte7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const protokolleLetzte7 = protokolle.filter((p) => p.datum >= letzte7).length;
  const offenZurReview = protokolle.filter((p) => p.status === "eingereicht").length;
  const fotosGesamt = protokolle.reduce(
    (s, p) =>
      s +
      p.sections.reduce((sec_s, sec) => sec_s + sec.photo_paths.length, 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="Putzprotokolle"
        description={`Tägliche Reinigungs-Protokolle ${
          aktiv ? `· ${aktiv.name}` : "(alle Standorte)"
        }. Letzte 30 Tage.`}
      />
      <PutzprotokolleNav />

      <StatGrid cols={4}>
        <StatCard
          label="Letzte 7 Tage"
          value={`${protokolleLetzte7} / 7`}
          icon={<ClipboardCheck />}
        />
        <StatCard
          label="Offen zum Review"
          value={offenZurReview}
          icon={<Sparkles />}
        />
        <StatCard
          label="Reviewed"
          value={protokolle.filter((p) => p.status === "reviewed").length}
          icon={<CheckCircle2 />}
        />
        <StatCard label="Fotos gesamt" value={fotosGesamt} icon={<Camera />} />
      </StatGrid>

      {protokolle.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-[hsl(var(--brand-pink))]" />
          <p className="mt-3 text-sm font-semibold">Noch keine Protokolle</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sobald die Frühschicht das erste Putzprotokoll einreicht, erscheint
            es hier.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {protokolle.map((p, i) => {
            const erledigtTasks = p.sections.reduce(
              (s, sec) => s + sec.tasks_done.length,
              0,
            );
            const fotos = p.sections.reduce(
              (s, sec) => s + sec.photo_paths.length,
              0,
            );
            const hatMaengel = p.sections.some((s) => s.maengel.trim().length > 0);
            return (
              <li
                key={p.id}
                className={i > 0 ? "border-t border-border" : ""}
              >
                <Link
                  href={`/admin/putzprotokolle/${p.id}`}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:gap-5 sm:px-5 sm:py-4"
                >
                  <div className="flex w-20 shrink-0 flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {new Date(p.datum + "T00:00:00").toLocaleDateString(
                        "de-DE",
                        { weekday: "short" },
                      )}
                    </span>
                    <span className="font-mono text-sm font-medium tabular-nums">
                      {formatDatum(p.datum)}
                    </span>
                  </div>
                  <ColoredAvatar
                    name={p.submitted_by_name ?? "?"}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.submitted_by_name ?? "Mitarbeiter:in"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {p.location_name ?? "—"} · {erledigtTasks} Aufgaben ·{" "}
                      {fotos} {fotos === 1 ? "Foto" : "Fotos"}
                      {hatMaengel ? " · Mängel" : ""}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    {p.status === "reviewed" ? (
                      <StatusPill ton="success">Reviewed</StatusPill>
                    ) : (
                      <StatusPill ton="warn">Offen</StatusPill>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
