import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  FileText,
  GraduationCap,
  Megaphone,
  Palmtree,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { PfadCard } from "@/components/lernpfad/PfadCard";
import { StatusBadge } from "@/components/StatusBadge";
import { requireProfile } from "@/lib/auth";
import { ladeMeineLernpfade, offeneLektionen } from "@/lib/lernpfade";
import { aktivitaetsStats } from "@/lib/lektion";
import { aktiveBannerInfo } from "@/lib/infos";
import { ladeMeineAufgaben } from "@/lib/aufgaben";
import { ladeSubmissions } from "@/lib/formulare";
import { getAktiverStandort } from "@/lib/standort-context";
import { AufgabenZeile } from "@/components/aufgaben/AufgabenZeile";
import { Tageszeitgruss } from "./Tageszeitgruss";
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

const QUICK_ACTIONS: {
  href: string;
  label: string;
  icon: typeof Stethoscope;
  tint: string;
}[] = [
  {
    href: "/formulare/krankmeldung",
    label: "Krankmeldung",
    icon: Stethoscope,
    tint: "bg-rose-500/10 text-rose-600",
  },
  {
    href: "/formulare/urlaubsantrag",
    label: "Urlaubsantrag",
    icon: Palmtree,
    tint: "bg-amber-500/10 text-amber-600",
  },
  {
    href: "/formulare/schicht-tausch",
    label: "Schicht tauschen",
    icon: CalendarClock,
    tint: "bg-sky-500/10 text-sky-600",
  },
  {
    href: "/maengel",
    label: "Mangel melden",
    icon: Wrench,
    tint: "bg-orange-500/10 text-orange-600",
  },
  {
    href: "/infos",
    label: "Info posten",
    icon: Megaphone,
    tint: "bg-violet-500/10 text-violet-600",
  },
];

const SUBMISSION_LABEL: Record<string, { label: string; tint: string }> = {
  eingereicht: { label: "Eingereicht", tint: "bg-blue-500/15 text-blue-700" },
  in_bearbeitung: {
    label: "In Bearbeitung",
    tint: "bg-amber-500/15 text-amber-700",
  },
  erledigt: {
    label: "Erledigt",
    tint: "bg-emerald-500/15 text-emerald-700",
  },
  abgelehnt: { label: "Abgelehnt", tint: "bg-rose-500/15 text-rose-700" },
};

export default async function DashboardPage() {
  const profile = await requireProfile();
  const aktiv = await getAktiverStandort();
  const [pfade, anzOffenePraxis, aktivitaet, banner, aufgaben, anfragen] =
    await Promise.all([
      ladeMeineLernpfade(profile.id),
      ladeOffenePraxis(profile.id),
      aktivitaetsStats(profile.id),
      aktiveBannerInfo(profile.id, aktiv?.id ?? null),
      ladeMeineAufgaben(profile.id, aktiv?.id ?? null),
      ladeSubmissions({
        submittedBy: profile.id,
        status: ["eingereicht", "in_bearbeitung"],
      }),
    ]);

  const gesamt = pfade.reduce((s, p) => s + p.gesamt, 0);
  const abgeschlossen = pfade.reduce((s, p) => s + p.abgeschlossen, 0);
  const offen = offeneLektionen(pfade, 5);
  const next = offen[0];
  const aufgabenHeute = aufgaben.heute.length;
  const offeneAnfragen = anfragen.length;

  const subline =
    aufgabenHeute === 0 && offeneAnfragen === 0
      ? "Heute keine offenen Aufgaben — alles ruhig."
      : [
          aufgabenHeute > 0
            ? `${aufgabenHeute} ${aufgabenHeute === 1 ? "Aufgabe" : "Aufgaben"} heute`
            : null,
          offeneAnfragen > 0
            ? `${offeneAnfragen} ${offeneAnfragen === 1 ? "offene Anfrage" : "offene Anfragen"}`
            : null,
          anzOffenePraxis > 0
            ? `${anzOffenePraxis} Praxis offen`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <div className="space-y-12">
      {/* === Banner: ungelesene wichtige Info === */}
      {banner && (
        <Link
          href="/infos"
          className={
            banner.importance === "critical"
              ? "group flex items-start gap-4 rounded-2xl border-2 border-[hsl(var(--destructive)/0.6)] bg-[hsl(var(--destructive)/0.05)] p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--destructive))]"
              : "group flex items-start gap-4 rounded-2xl border-2 border-[hsl(var(--warning)/0.5)] bg-[hsl(var(--warning)/0.05)] p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--warning))]"
          }
        >
          <span
            className={
              banner.importance === "critical"
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-white"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--warning))] text-white"
            }
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p
              className={
                banner.importance === "critical"
                  ? "text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--destructive))]"
                  : "text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--warning))]"
              }
            >
              {banner.importance === "critical" ? "Dringend" : "Wichtig"}
            </p>
            <p className="mt-0.5 text-base font-semibold leading-tight">
              {banner.title}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* === Hero: Tagesüberblick === */}
      <section>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
          Mein Tag
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(2rem,4vw,3.5rem)]">
          <Tageszeitgruss name={profile.full_name} />.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subline}
        </p>
      </section>

      {/* === Quick-Actions === */}
      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
          Schnell-Aktionen
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((qa) => {
            const Icon = qa.icon;
            return (
              <Link
                key={qa.href}
                href={qa.href}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.25)]"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${qa.tint}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="flex w-full items-end justify-between">
                  <span className="text-sm font-semibold leading-tight">
                    {qa.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--primary))]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* === Aufgaben heute === */}
      {aufgaben.heute.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
                Heute zu erledigen
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Aufgaben
              </h2>
            </div>
            <Link
              href="/aufgaben"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Alle ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {aufgaben.heute.slice(0, 5).map((a, i) => (
              <li key={a.id} className={i > 0 ? "border-t border-border" : ""}>
                <AufgabenZeile a={a} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* === Meine offenen Anfragen === */}
      {anfragen.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
                Status deiner Anträge
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Meine Anfragen
              </h2>
            </div>
            <Link
              href="/formulare"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Alle ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {anfragen.slice(0, 4).map((s, i) => {
              const meta = SUBMISSION_LABEL[s.status] ?? {
                label: s.status,
                tint: "bg-muted text-muted-foreground",
              };
              return (
                <li
                  key={s.id}
                  className={
                    i > 0
                      ? "flex items-center gap-4 border-t border-border px-5 py-4"
                      : "flex items-center gap-4 px-5 py-4"
                  }
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.08)] text-[hsl(var(--brand-pink))]">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {s.template_title ?? "Anfrage"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Eingereicht{" "}
                      {new Date(s.submitted_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tint}`}
                  >
                    {meta.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* === Mein Lernen (kompakt) === */}
      {(next || pfade.length > 0) && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
                Mein Lernen
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {next ? "Heute weitermachen" : "Deine Lernpfade"}
              </h2>
            </div>
            <Link
              href="/lernpfade"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {next
                ? `${abgeschlossen}/${gesamt} Lektionen`
                : "Alle ansehen"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {next ? (
            <Link
              href={`/lektionen/${next.lesson_id}`}
              className="group relative grid gap-6 overflow-hidden rounded-2xl border border-border bg-[hsl(var(--brand-ink))] p-6 text-[hsl(var(--brand-cream))] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-25px_hsl(var(--primary)/0.4)] sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 right-[-10%] h-[400px] w-[400px] rounded-full opacity-25 blur-[100px]"
                style={{
                  background:
                    "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
                }}
              />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--brand-cream)/0.55)]">
                  <GraduationCap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  <span>{next.path_title}</span>
                  <span>·</span>
                  <span>{next.module_title}</span>
                </div>
                <h3 className="mt-3 max-w-[36ch] text-balance font-semibold leading-tight tracking-tight text-[hsl(var(--brand-cream))] text-xl sm:text-2xl">
                  {next.lesson_title}
                </h3>
                <div className="mt-3">
                  <StatusBadge status={next.status} />
                </div>
              </div>
              <span className="relative flex h-12 w-12 items-center justify-center justify-self-end rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>
          ) : pfade.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {pfade.slice(0, 2).map((pfad) => (
                <PfadCard
                  key={pfad.id}
                  id={pfad.id}
                  title={pfad.title}
                  description={pfad.description}
                  modulAnzahl={pfad.modules.length}
                  abgeschlossen={pfad.abgeschlossen}
                  gesamt={pfad.gesamt}
                  prozent={pfad.prozent}
                  heroImagePath={pfad.hero_image_path}
                />
              ))}
            </div>
          ) : null}
        </section>
      )}

      {gesamt > 0 && abgeschlossen === gesamt && (
        <section className="rounded-2xl border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.06)] p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="mt-4 text-base font-semibold">
            Alle Lektionen abgeschlossen — stark!
          </p>
          {anzOffenePraxis > 0 && (
            <Link
              href="/praxisfreigaben"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--success))] hover:underline"
            >
              <CheckSquare className="h-4 w-4" />
              {anzOffenePraxis}{" "}
              {anzOffenePraxis === 1 ? "Praxisfreigabe" : "Praxisfreigaben"} offen
            </Link>
          )}
        </section>
      )}

      {/* === Handbuch-Promo (kompakt) === */}
      <section>
        <Link
          href="/wissen"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.3)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              Vitness Handbuch
            </p>
            <p className="mt-0.5 text-base font-semibold">
              Schnelle Antworten für den Studio-Alltag
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--primary))]" />
        </Link>
      </section>

      {/* Aktivitäts-Hinweis (kompakt unten) */}
      {aktivitaet.tageLetzte30 > 0 && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          {aktivitaet.tageLetzte30} Tage aktiv in den letzten 30
          {next && (
            <>
              {" "}· <FileText className="h-3 w-3" /> Lerne weiter
            </>
          )}
        </p>
      )}
    </div>
  );
}
