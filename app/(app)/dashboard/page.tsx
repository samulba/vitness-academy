import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarPlus,
  CheckSquare,
  ClipboardList,
  FileText,
  GraduationCap,
  Megaphone,
  MessageSquarePlus,
  Palmtree,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ladeMeineLernpfade, offeneLektionen } from "@/lib/lernpfade";
import { aktivitaetsStats } from "@/lib/lektion";
import { aktiveBannerInfo, ladeAnnouncements } from "@/lib/infos";
import { formatDatum } from "@/lib/format";
import { ladeMeineAufgaben } from "@/lib/aufgaben";
import { ladeSubmissions } from "@/lib/formulare";
import { getAktiverStandort } from "@/lib/standort-context";
import { AufgabenZeile } from "@/components/aufgaben/AufgabenZeile";
import { PutzprotokollHeuteCard } from "@/components/putzprotokoll/PutzprotokollHeuteCard";
import { Tageszeitgruss } from "./Tageszeitgruss";
import { Heutedatum } from "./Heutedatum";
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
    href: "/lohn",
    label: "Schicht eintragen",
    icon: CalendarPlus,
    tint: "bg-sky-500/10 text-sky-600",
  },
  {
    href: "/putzprotokoll",
    label: "Putzprotokoll",
    icon: Sparkles,
    tint: "bg-cyan-500/10 text-cyan-600",
  },
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
    href: "/maengel",
    label: "Mangel melden",
    icon: Wrench,
    tint: "bg-orange-500/10 text-orange-600",
  },
  {
    href: "/feedback",
    label: "Feedback erfassen",
    icon: MessageSquarePlus,
    tint: "bg-emerald-500/10 text-emerald-600",
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
  const [
    pfade,
    anzOffenePraxis,
    aktivitaet,
    banner,
    aufgaben,
    anfragen,
    infos,
  ] = await Promise.all([
    ladeMeineLernpfade(profile.id),
    ladeOffenePraxis(profile.id),
    aktivitaetsStats(profile.id),
    aktiveBannerInfo(profile.id, aktiv?.id ?? null),
    ladeMeineAufgaben(profile.id, aktiv?.id ?? null),
    ladeSubmissions({
      submittedBy: profile.id,
      status: ["eingereicht", "in_bearbeitung"],
    }),
    ladeAnnouncements({ locationId: aktiv?.id ?? null }),
  ]);

  const aktuelleInfos = infos
    .filter((i) => !banner || i.id !== banner.id)
    .slice(0, 3);

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
    <div className="space-y-6 sm:space-y-12">
      {/* === Banner: ungelesene wichtige Info === */}
      {banner && (
        <Link
          href="/infos"
          className={
            banner.importance === "critical"
              ? "group flex items-start gap-3 rounded-xl border-2 border-[hsl(var(--destructive)/0.6)] bg-[hsl(var(--destructive)/0.05)] p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--destructive))] sm:gap-4 sm:rounded-2xl sm:p-5"
              : "group flex items-start gap-3 rounded-xl border-2 border-[hsl(var(--warning)/0.5)] bg-[hsl(var(--warning)/0.05)] p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--warning))] sm:gap-4 sm:rounded-2xl sm:p-5"
          }
        >
          <span
            className={
              banner.importance === "critical"
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-white sm:h-10 sm:w-10"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--warning))] text-white sm:h-10 sm:w-10"
            }
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={
                banner.importance === "critical"
                  ? "text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--destructive))]"
                  : "text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--warning))]"
              }
            >
              {banner.importance === "critical" ? "Dringend" : "Wichtig"}
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-tight sm:text-base">
              {banner.title}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* === Hero: Tagesüberblick === */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:rounded-3xl sm:p-10">
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
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))] sm:text-[11px] sm:tracking-[0.22em]">
            <span className="h-px w-8 bg-[hsl(var(--primary))] sm:w-10" />
            <span>Mein Tag</span>
            <span className="text-muted-foreground">
              · <Heutedatum />
            </span>
          </div>

          <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.375rem,5vw,3.5rem)] sm:mt-6 sm:leading-[1.05]">
            <Tageszeitgruss name={profile.full_name} />.
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-snug text-muted-foreground sm:mt-3 sm:text-lg sm:leading-relaxed">
            {subline}
          </p>

          {/* Stats: sauber als 2-Spalten-Grid auf Mobile,
              flex-wrap auf Desktop (mehr Items moeglich). */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-wrap">
            <HeroStat
              icon={<ClipboardList className="h-3.5 w-3.5" />}
              label="Aufgaben heute"
              wert={aufgabenHeute}
              href="/aufgaben"
            />
            <HeroStat
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Offene Anfragen"
              wert={offeneAnfragen}
              href="/formulare"
              akzent={offeneAnfragen > 0 ? "primary" : undefined}
            />
            {anzOffenePraxis > 0 && (
              <HeroStat
                icon={<CheckSquare className="h-3.5 w-3.5" />}
                label="Praxis offen"
                wert={anzOffenePraxis}
                href="/praxisfreigaben"
                akzent="primary"
              />
            )}
            {aktivitaet.tageLetzte30 > 0 && (
              <HeroStat
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="Tage aktiv"
                wert={aktivitaet.tageLetzte30}
              />
            )}
            {gesamt > 0 && abgeschlossen < gesamt && (
              <HeroStat
                icon={<GraduationCap className="h-3.5 w-3.5" />}
                label="Lektionen"
                wert={`${abgeschlossen}/${gesamt}`}
                href="/lernpfade"
              />
            )}
          </div>
        </div>
      </section>

      {/* === Quick-Actions === */}
      <section>
        <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))] sm:text-[11px] sm:tracking-[0.22em]">
          Schnell-Aktionen
        </h2>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((qa) => {
            const Icon = qa.icon;
            return (
              <Link
                key={qa.href}
                href={qa.href}
                className="group relative flex flex-col items-start gap-2.5 rounded-xl border border-border bg-card p-3 transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.25)] sm:gap-3 sm:rounded-2xl sm:p-5"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${qa.tint}`}
                >
                  <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[13px] font-semibold leading-tight sm:text-sm">
                  {qa.label}
                </span>
                <ArrowUpRight className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--primary))] sm:right-3 sm:top-3 sm:h-4 sm:w-4" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* === Aktuelle Infos ===
          Visuell hervorgehoben gegenueber den anderen Card-Sections
          (Mein Lernen, Handbuch). Magenta-tinted Container + farbige
          Severity-Leiste links auf jedem Eintrag. */}
      {aktuelleInfos.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl border border-[hsl(var(--brand-pink)/0.25)] bg-gradient-to-br from-[hsl(var(--brand-pink)/0.06)] via-card to-card p-4 shadow-[0_8px_32px_-12px_hsl(var(--brand-pink)/0.18)] sm:p-6">
          {/* dekorativer Magenta-Glow oben rechts */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[hsl(var(--brand-pink)/0.15)] blur-3xl"
          />

          <header className="relative flex items-end justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))] sm:text-[11px]">
                <Megaphone className="h-3 w-3" strokeWidth={2} />
                Aktuell aus dem Studio
              </p>
              <h2 className="mt-1.5 text-[18px] font-semibold tracking-tight sm:text-xl">
                Wichtige Infos
              </h2>
            </div>
            <Link
              href="/infos"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-[hsl(var(--brand-pink))]"
            >
              Alle ansehen
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>

          <ul className="relative mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
            {aktuelleInfos.map((info) => {
              const importance =
                info.importance === "critical"
                  ? {
                      label: "Dringend",
                      pill:
                        "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
                      bar: "bg-[hsl(var(--destructive))]",
                      iconColor: "text-[hsl(var(--destructive))]",
                    }
                  : info.importance === "warning"
                    ? {
                        label: "Wichtig",
                        pill:
                          "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                        bar: "bg-amber-500",
                        iconColor: "text-amber-600 dark:text-amber-400",
                      }
                    : {
                        label: "Info",
                        pill:
                          "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
                        bar: "bg-[hsl(var(--brand-pink))]",
                        iconColor: "text-[hsl(var(--brand-pink))]",
                      };
              return (
                <li key={info.id}>
                  <Link
                    href="/infos"
                    className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 pl-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[0_12px_32px_-16px_hsl(var(--primary)/0.25)] sm:p-4 sm:pl-5"
                  >
                    {/* Severity-Leiste links */}
                    <span
                      aria-hidden
                      className={`absolute left-0 top-0 h-full w-1 ${importance.bar}`}
                    />
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted ${importance.iconColor}`}
                    >
                      {info.pinned ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <Megaphone className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${importance.pill}`}
                        >
                          {importance.label}
                        </span>
                        {info.pinned && (
                          <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                            Pin
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground sm:text-xs">
                          {formatDatum(info.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold leading-tight sm:mt-1.5 sm:text-[15px]">
                        {info.title}
                      </p>
                      {info.body && (
                        <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground sm:text-sm">
                          {info.body}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* === Putzprotokoll heute (virtuelle Aufgabe) === */}
      {aktiv && (
        <PutzprotokollHeuteCard
          locationId={aktiv.id}
          locationName={aktiv.name}
        />
      )}

      {/* === Aufgaben heute === */}
      {aufgaben.heute.length > 0 && (
        <section className="space-y-3 sm:space-y-5">
          <SectionHeader
            eyebrow="Heute zu erledigen"
            titel="Aufgaben"
            href="/aufgaben"
          />
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
        <section className="space-y-3 sm:space-y-5">
          <SectionHeader
            eyebrow="Status deiner Anträge"
            titel="Meine Anfragen"
            href="/formulare"
          />
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
                      ? "flex items-center gap-3 border-t border-border px-4 py-3 sm:gap-4 sm:px-5 sm:py-4"
                      : "flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4"
                  }
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.08)] text-[hsl(var(--brand-pink))]">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {s.template_title ?? "Anfrage"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                      {new Date(s.submitted_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:px-2.5 sm:py-1 sm:text-[11px] ${meta.tint}`}
                  >
                    {meta.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}


      {/* === Mein Lernen (kompakt) — nur wenn offene Lektion === */}
      {next && abgeschlossen < gesamt && (
        <section>
          <Link
            href={`/lektionen/${next.lesson_id}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.25)] sm:gap-4 sm:rounded-2xl sm:p-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] sm:h-11 sm:w-11">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))] sm:text-[11px]">
                Mein Lernen · {abgeschlossen}/{gesamt}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold sm:text-base">
                {next.lesson_title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {next.path_title} · {next.module_title}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--primary))] sm:h-5 sm:w-5" />
          </Link>
        </section>
      )}

      {/* === Handbuch-Promo (kompakt) === */}
      <section>
        <Link
          href="/wissen"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.3)] sm:gap-4 sm:rounded-2xl sm:p-5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))] sm:h-11 sm:w-11">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))] sm:text-[11px]">
              Vitness Handbuch
            </p>
            <p className="mt-0.5 text-sm font-semibold sm:text-base">
              Schnelle Antworten für den Studio-Alltag
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--primary))] sm:h-5 sm:w-5" />
        </Link>
      </section>

    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Section-Header (responsiv: Eyebrow + Titel + "Alle ansehen"-Link)    */
/* -------------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  titel,
  href,
}: {
  eyebrow: string;
  titel: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))] sm:text-[11px] sm:tracking-[0.22em]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight sm:mt-2 sm:text-3xl">
          {titel}
        </h2>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
      >
        <span className="hidden sm:inline">Alle ansehen</span>
        <span className="sm:hidden">Alle</span>
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Hero-Helpers                                                         */
/* -------------------------------------------------------------------- */

function HeroStat({
  icon,
  label,
  wert,
  href,
  akzent,
}: {
  icon: React.ReactNode;
  label: string;
  wert: number | string;
  href?: string;
  akzent?: "primary" | "success";
}) {
  const akzentBg =
    akzent === "primary"
      ? "border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
      : akzent === "success"
        ? "border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]"
        : "border-border bg-background text-foreground";

  // Mobile: Card-Style mit Label+Icon links + Wert rechts (volle Grid-
  // Cell-Breite). Desktop: Pill-Style fuer Inline-Wrap.
  const inhalt = (
    <span
      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors sm:w-auto sm:rounded-full sm:py-1.5 ${akzentBg} ${
        href ? "hover:bg-muted" : ""
      }`}
    >
      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground sm:flex-none">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="font-bold tabular-nums">{wert}</span>
    </span>
  );

  if (href)
    return (
      <Link href={href} className="block sm:inline-block">
        {inhalt}
      </Link>
    );
  return inhalt;
}
