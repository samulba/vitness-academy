import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  GraduationCap,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PfadCard } from "@/components/lernpfad/PfadCard";
import { StatusBadge } from "@/components/StatusBadge";
import { requireProfile } from "@/lib/auth";
import { ladeMeineLernpfade, offeneLektionen } from "@/lib/lernpfade";
import { formatProzent, tageszeitGruss } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

async function ladeOffenePraxis(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_practical_signoffs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["offen", "abgelehnt"]);
  return count ?? 0;
}

export default async function DashboardPage() {
  const profile = await requireProfile();
  const [pfade, anzOffenePraxis] = await Promise.all([
    ladeMeineLernpfade(profile.id),
    ladeOffenePraxis(profile.id),
  ]);

  const gesamt = pfade.reduce((s, p) => s + p.gesamt, 0);
  const abgeschlossen = pfade.reduce((s, p) => s + p.abgeschlossen, 0);
  const prozent = gesamt === 0 ? 0 : (abgeschlossen / gesamt) * 100;
  const offen = offeneLektionen(pfade, 5);
  const next = offen[0];

  return (
    <div className="space-y-14">
      {/* === Hero === */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10">
        {/* Subtiler Magenta-Glow rechts oben */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-[-10%] h-[400px] w-[400px] rounded-full opacity-[0.10] blur-[100px]"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
          }}
        />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
            <span className="h-px w-10 bg-[hsl(var(--primary))]" />
            <span>Mein Dashboard</span>
            <span className="text-muted-foreground">
              · {formatProzent(prozent)} Gesamtfortschritt
            </span>
          </div>

          <h1 className="mt-6 text-balance font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(2rem,4vw,3.5rem)]">
            {tageszeitGruss(profile.full_name)}.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {gesamt === 0
              ? "Sobald dir Lernpfade zugewiesen sind, geht's hier los."
              : abgeschlossen === gesamt
              ? "Alle Lektionen abgeschlossen — stark!"
              : `Du hast ${offen.length} ${
                  offen.length === 1 ? "offene Lektion" : "offene Lektionen"
                } — und ${abgeschlossen} schon geschafft.`}
          </p>

          {/* Progress + Stats kombiniert */}
          {gesamt > 0 && (
            <div className="mt-10 space-y-5">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium uppercase tracking-wider text-muted-foreground">
                    Fortschritt
                  </span>
                  <span className="font-semibold tabular-nums">
                    {abgeschlossen} / {gesamt} Lektionen
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--primary))] transition-[width] duration-500"
                    style={{ width: `${prozent}%` }}
                  />
                </div>
              </div>

              {/* Stat-Pills inline */}
              <div className="flex flex-wrap gap-2">
                <StatPill
                  icon={<GraduationCap className="h-3.5 w-3.5" />}
                  label="Lernpfade"
                  wert={pfade.length}
                  href="/lernpfade"
                />
                <StatPill
                  icon={<BookOpen className="h-3.5 w-3.5" />}
                  label="Offen"
                  wert={offen.length}
                />
                <StatPill
                  icon={<Trophy className="h-3.5 w-3.5" />}
                  label="Abgeschlossen"
                  wert={abgeschlossen}
                  akzent="success"
                />
                <StatPill
                  icon={<CheckSquare className="h-3.5 w-3.5" />}
                  label="Praxis offen"
                  wert={anzOffenePraxis}
                  href="/praxisfreigaben"
                  akzent={anzOffenePraxis > 0 ? "primary" : undefined}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* === Heute weitermachen (Featured Next-Up) === */}
      {next && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
              Heute weitermachen
            </h2>
          </div>
          <Link
            href={`/lektionen/${next.lesson_id}`}
            className="group relative grid gap-6 overflow-hidden rounded-3xl border border-border bg-[hsl(var(--brand-ink))] p-6 text-[hsl(var(--brand-cream))] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-25px_hsl(var(--primary)/0.45)] sm:grid-cols-[1fr_auto] sm:items-end sm:p-10"
          >
            {/* Magenta-Glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 right-[-10%] h-[450px] w-[450px] rounded-full opacity-25 blur-[100px]"
              style={{
                background:
                  "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--brand-cream)/0.55)]">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                <span className="font-medium uppercase tracking-wider">
                  Nächster Schritt
                </span>
                <span>·</span>
                <span>{next.path_title}</span>
                <span>·</span>
                <span>{next.module_title}</span>
              </div>
              <h3 className="mt-4 max-w-[24ch] text-balance font-semibold leading-tight tracking-tight text-[hsl(var(--brand-cream))] text-[clamp(1.5rem,2.5vw,2.25rem)]">
                {next.lesson_title}
              </h3>
              <div className="mt-4">
                <StatusBadge status={next.status} />
              </div>
            </div>

            <div className="relative flex items-center gap-3 self-end sm:self-auto">
              <span className="hidden text-sm font-medium text-[hsl(var(--brand-cream)/0.7)] sm:inline">
                Lektion öffnen
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* === Lernpfade === */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
              Deine Kapitel
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Meine Lernpfade
            </h2>
          </div>
          <Link
            href="/lernpfade"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Alle ansehen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pfade.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            Dir wurden noch keine Lernpfade zugewiesen. Sprich kurz dein
            Studio-Team an.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pfade.map((pfad) => (
              <PfadCard
                key={pfad.id}
                id={pfad.id}
                title={pfad.title}
                description={pfad.description}
                modulAnzahl={pfad.modules.length}
                abgeschlossen={pfad.abgeschlossen}
                gesamt={pfad.gesamt}
                prozent={pfad.prozent}
              />
            ))}
          </div>
        )}
      </section>

      {/* === Offene Lektionen === */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Offene Lektionen
        </h2>

        {offen.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-medium">
              Aktuell keine offenen Lektionen — stark!
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {offen.map((eintrag, i) => (
              <li
                key={eintrag.lesson_id}
                className={i > 0 ? "border-t border-border" : ""}
              >
                <Link
                  href={`/lektionen/${eintrag.lesson_id}`}
                  className="group relative flex items-center gap-5 px-6 py-5 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-3 left-0 w-[3px] origin-top scale-y-0 rounded-r-full bg-[hsl(var(--primary))] transition-transform duration-200 group-hover:scale-y-100"
                  />
                  <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {eintrag.path_title} · {eintrag.module_title}
                    </span>
                    <p className="mt-1 truncate text-base font-semibold tracking-tight">
                      {eintrag.lesson_title}
                    </p>
                  </div>
                  <StatusBadge status={eintrag.status} />
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* === Handbuch-Promo (kompakt) === */}
      <section>
        <Link
          href="/wissen"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.3)] sm:p-8"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              Vitness Handbuch
            </p>
            <p className="mt-0.5 text-base font-semibold sm:text-lg">
              Schnelle Antworten für den Studio-Alltag
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--primary))]" />
        </Link>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Stat-Pill                                                             */
/* -------------------------------------------------------------------- */

function StatPill({
  icon,
  label,
  wert,
  href,
  akzent,
}: {
  icon: React.ReactNode;
  label: string;
  wert: number;
  href?: string;
  akzent?: "primary" | "success";
}) {
  const akzentBg =
    akzent === "primary"
      ? "border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
      : akzent === "success"
      ? "border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]"
      : "border-border bg-background text-foreground";

  const inhalt = (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${akzentBg} ${
        href ? "hover:bg-muted" : ""
      }`}
    >
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-bold tabular-nums">{wert}</span>
    </span>
  );

  if (href) return <Link href={href}>{inhalt}</Link>;
  return inhalt;
}
