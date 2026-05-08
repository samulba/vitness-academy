import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Cake,
  CheckCircle2,
  CheckSquare,
  Clock,
  Euro,
  FileText,
  GraduationCap,
  Inbox,
  ListTodo,
  Megaphone,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import { ladeGeburtstageNaechste } from "@/lib/mitarbeiter-stammdaten";
import { tagesCounts, trendAusVerlauf } from "@/lib/admin/sparklines";
import { formatDatum } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import { MangelStatusBadge } from "@/components/maengel/StatusBadge";

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeekIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString();
}

async function ladePuls() {
  const supabase = await createClient();
  const heute = startOfTodayIso();
  const woche = startOfWeekIso();

  // Eine RPC statt 9 separate Counts -- spart 8x Roundtrip-Latenz.
  // Defensive Fallback (alte 9-Query-Variante) falls Migration 0048
  // noch nicht eingespielt ist.
  try {
    const { data, error } = await supabase.rpc("get_studio_pulse", {
      heute,
      woche,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      return {
        mitarbeiter: Number(row.mitarbeiter ?? 0),
        lernpfade: Number(row.lernpfade ?? 0),
        lektionenHeute: Number(row.lektionen_heute ?? 0),
        maengelOffen: Number(row.maengel_offen ?? 0),
        maengelHeute: Number(row.maengel_heute ?? 0),
        submissionsOffen: Number(row.submissions_offen ?? 0),
        submissionsHeute: Number(row.submissions_heute ?? 0),
        aufgabenOffen: Number(row.aufgaben_offen ?? 0),
        aktiveDieseWoche: Number(row.aktive_diese_woche ?? 0),
      };
    }
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.warn("[ladePuls] RPC fehlgeschlagen, fallback auf Einzel-Counts", e);
  }

  // Fallback: 9 separate Counts (langsam, aber funktioniert auch
  // ohne Migration 0048).
  const [
    { count: anzMitarbeiter },
    { count: anzLernpfade },
    { count: lektionenHeute },
    { count: maengelOffen },
    { count: maengelHeute },
    { count: submissionsOffen },
    { count: submissionsHeute },
    { count: aufgabenOffen },
    { count: aktiveDieseWoche },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("learning_paths")
      .select("*", { count: "exact", head: true })
      .eq("status", "aktiv"),
    supabase
      .from("user_lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("status", "abgeschlossen")
      .gte("completed_at", heute),
    supabase
      .from("studio_issues")
      .select("*", { count: "exact", head: true })
      .in("status", ["offen", "in_bearbeitung"]),
    supabase
      .from("studio_issues")
      .select("*", { count: "exact", head: true })
      .gte("created_at", heute),
    supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true })
      .in("status", ["eingereicht", "in_bearbeitung"]),
    supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", heute),
    supabase
      .from("studio_tasks")
      .select("*", { count: "exact", head: true })
      .is("completed_at", null),
    supabase
      .from("user_lesson_progress")
      .select("user_id", { count: "exact", head: true })
      .gte("last_seen_at", woche),
  ]);

  return {
    mitarbeiter: anzMitarbeiter ?? 0,
    lernpfade: anzLernpfade ?? 0,
    lektionenHeute: lektionenHeute ?? 0,
    maengelOffen: maengelOffen ?? 0,
    maengelHeute: maengelHeute ?? 0,
    submissionsOffen: submissionsOffen ?? 0,
    submissionsHeute: submissionsHeute ?? 0,
    aufgabenOffen: aufgabenOffen ?? 0,
    aktiveDieseWoche: aktiveDieseWoche ?? 0,
  };
}

type AktiverMangel = {
  id: string;
  title: string;
  status: "offen" | "in_bearbeitung" | "behoben" | "verworfen";
  severity: "niedrig" | "normal" | "kritisch";
  created_at: string;
  reporter: string | null;
};

async function ladePraxisOffen(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_practical_signoffs")
    .select("id", { count: "exact", head: true })
    .eq("status", "bereit");
  return count ?? 0;
}

async function ladeAktiveMaengel(): Promise<AktiverMangel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_issues")
    .select(
      "id, title, status, severity, created_at, reporter:reported_by ( full_name )",
    )
    .in("status", ["offen", "in_bearbeitung"])
    .order("created_at", { ascending: false })
    .limit(5);
  type Roh = {
    id: string;
    title: string;
    status: string;
    severity: string;
    created_at: string;
    reporter: { full_name: string | null } | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status as AktiverMangel["status"],
    severity: r.severity as AktiverMangel["severity"],
    created_at: r.created_at,
    reporter: r.reporter?.full_name ?? null,
  }));
}

type FrischeSubmission = {
  id: string;
  template_title: string | null;
  status: string;
  submitted_at: string;
  submitter: string | null;
};

async function ladeFrischeSubmissions(): Promise<FrischeSubmission[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("form_submissions")
    .select(
      `id, status, submitted_at,
       submitter:submitted_by ( full_name ),
       template:template_id ( title )`,
    )
    .order("submitted_at", { ascending: false })
    .limit(5);
  type Roh = {
    id: string;
    status: string;
    submitted_at: string;
    submitter: { full_name: string | null } | null;
    template: { title: string | null } | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((r) => ({
    id: r.id,
    template_title: r.template?.title ?? null,
    status: r.status,
    submitted_at: r.submitted_at,
    submitter: r.submitter?.full_name ?? null,
  }));
}

type AktiverMitarbeiter = {
  user_id: string;
  full_name: string | null;
  last_seen_at: string;
};

async function ladeAktiveMitarbeiter(): Promise<AktiverMitarbeiter[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("user_id, last_seen_at, profile:user_id ( full_name )")
    .not("last_seen_at", "is", null)
    .order("last_seen_at", { ascending: false })
    .limit(20);
  type Roh = {
    user_id: string;
    last_seen_at: string;
    profile: { full_name: string | null } | null;
  };
  const seen = new Set<string>();
  const out: AktiverMitarbeiter[] = [];
  for (const r of (data ?? []) as unknown as Roh[]) {
    if (seen.has(r.user_id)) continue;
    seen.add(r.user_id);
    out.push({
      user_id: r.user_id,
      full_name: r.profile?.full_name ?? null,
      last_seen_at: r.last_seen_at,
    });
    if (out.length === 5) break;
  }
  return out;
}

const QUICK_ACTIONS: {
  href: string;
  label: string;
  icon: typeof Megaphone;
  tint: string;
}[] = [
  {
    href: "/admin/infos/neu",
    label: "Info posten",
    icon: Megaphone,
    tint: "bg-violet-500/10 text-violet-600",
  },
  {
    href: "/admin/benutzer/neu",
    label: "Mitarbeiter anlegen",
    icon: UserPlus,
    tint: "bg-sky-500/10 text-sky-600",
  },
  {
    href: "/admin/lohn",
    label: "Lohn hochladen",
    icon: Euro,
    tint: "bg-emerald-500/10 text-emerald-600",
  },
  {
    href: "/admin/putzprotokolle/auswertung",
    label: "Putz-Auswertung",
    icon: Activity,
    tint: "bg-cyan-500/10 text-cyan-600",
  },
];

const SUBMISSION_LABEL: Record<string, string> = {
  eingereicht: "Neu",
  in_bearbeitung: "In Bearbeitung",
  erledigt: "Erledigt",
  abgelehnt: "Abgelehnt",
};

function relativeZeit(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const std = Math.floor(min / 60);
  if (std < 24) return `vor ${std} Std`;
  const tage = Math.floor(std / 24);
  if (tage < 7) return `vor ${tage} Tg`;
  return formatDatum(iso);
}

export default async function AdminDashboardPage() {
  await requireRole(["admin", "superadmin", "fuehrungskraft"]);
  const [
    puls,
    praxisOffen,
    maengel,
    submissions,
    mitarbeiter,
    geburtstage,
    sparkMaengel,
    sparkSubmissions,
    sparkAufgaben,
    sparkPraxis,
  ] = await Promise.all([
    ladePuls(),
    ladePraxisOffen(),
    ladeAktiveMaengel(),
    ladeFrischeSubmissions(),
    ladeAktiveMitarbeiter(),
    ladeGeburtstageNaechste(14),
    tagesCounts("studio_issues", "created_at"),
    tagesCounts("form_submissions", "submitted_at"),
    tagesCounts("studio_tasks", "created_at"),
    tagesCounts("user_practical_signoffs", "submitted_at"),
  ]);
  const trendMaengel = trendAusVerlauf(sparkMaengel);
  const trendSubmissions = trendAusVerlauf(sparkSubmissions);
  const trendAufgaben = trendAusVerlauf(sparkAufgaben);
  const trendPraxis = trendAusVerlauf(sparkPraxis);

  const todoSumme =
    puls.maengelOffen +
    puls.submissionsOffen +
    puls.aufgabenOffen +
    praxisOffen;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verwaltung"
        title="Studio-Puls"
        description="Was wartet heute auf Dich? Inbox + Schnell-Aktionen für den Studio-Alltag."
      />

      {/* Quick-Actions: haeufige Admin-Aktionen direkt aus dem Dashboard */}
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))] sm:text-[11px] sm:tracking-[0.22em]">
          Schnell-Aktionen
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3">
          {QUICK_ACTIONS.map((qa) => {
            const Icon = qa.icon;
            return (
              <Link
                key={qa.href}
                href={qa.href}
                className="group flex min-h-[80px] flex-col items-start justify-between gap-2.5 rounded-xl border border-border bg-card p-3.5 transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.25)] sm:gap-3 sm:rounded-2xl sm:p-4"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${qa.tint}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--primary))]" />
                </div>
                <span className="text-[13px] font-semibold leading-tight">
                  {qa.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Inbox: Was wartet heute auf Entscheidung/Bearbeitung */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))] sm:text-[11px] sm:tracking-[0.22em]">
            Brennt heute?
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {todoSumme}{" "}
            {todoSumme === 1 ? "Punkt" : "Punkte"} offen
          </span>
        </div>
        <StatGrid cols={4}>
          <StatCard
            label="Mängel offen"
            value={puls.maengelOffen}
            icon={<AlertTriangle />}
            trend={
              sparkMaengel.some((v) => v > 0)
                ? { ...trendMaengel, hint: "letzte 7 Tage" }
                : undefined
            }
            sparklineData={sparkMaengel}
            href="/admin/maengel"
          />
          <StatCard
            label="Einreichungen offen"
            value={puls.submissionsOffen}
            icon={<Inbox />}
            trend={
              sparkSubmissions.some((v) => v > 0)
                ? { ...trendSubmissions, hint: "letzte 7 Tage" }
                : undefined
            }
            sparklineData={sparkSubmissions}
            href="/admin/formulare/eingaenge"
          />
          <StatCard
            label="Aufgaben offen"
            value={puls.aufgabenOffen}
            icon={<ListTodo />}
            trend={
              sparkAufgaben.some((v) => v > 0)
                ? { ...trendAufgaben, hint: "letzte 7 Tage" }
                : undefined
            }
            sparklineData={sparkAufgaben}
            href="/admin/aufgaben"
          />
          <StatCard
            label="Praxis-Anfragen"
            value={praxisOffen}
            icon={<CheckSquare />}
            trend={
              sparkPraxis.some((v) => v > 0)
                ? { ...trendPraxis, hint: "letzte 7 Tage" }
                : undefined
            }
            sparklineData={sparkPraxis}
            href="/admin/praxisfreigaben"
          />
        </StatGrid>
      </section>

      {/* Geburtstage in den nächsten 14 Tagen */}
      {geburtstage.length > 0 && (
        <section className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Cake className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
              <h2 className="text-sm font-semibold tracking-tight">
                Geburtstage
              </h2>
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                · nächste 14 Tage
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {geburtstage.length}{" "}
              {geburtstage.length === 1 ? "Person" : "Personen"}
            </span>
          </header>
          <ul className="divide-y divide-border">
            {geburtstage.map((g) => (
              <li
                key={g.id}
                className="flex items-center gap-3 px-4 py-2.5 sm:px-5"
              >
                <ColoredAvatar name={g.full_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {g.full_name ?? "—"}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      wird {g.alter_neu}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2.5 py-1 text-[10px] font-semibold text-[hsl(var(--brand-pink))] sm:text-[11px]">
                  {g.tage_bis === 0
                    ? "🎂 heute"
                    : g.tage_bis === 1
                      ? "morgen"
                      : `in ${g.tage_bis}T`}
                </span>
                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                  {formatDatum(g.naechster_geburtstag)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Zwei-Spalten: Mängel + Einreichungen */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ListCard
          title="Aktive Mängel"
          subtitle="Was gerade nicht funktioniert."
          allHref="/admin/maengel"
        >
          {maengel.length === 0 ? (
            <EmptyState
              title="Keine offenen Mängel"
              description="Alles im grünen Bereich."
            />
          ) : (
            <ul className="divide-y divide-border">
              {maengel.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/admin/maengel/${m.id}`}
                    className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)]"
                  >
                    <span
                      className={
                        m.severity === "kritisch"
                          ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive"
                          : m.severity === "normal"
                            ? "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500"
                            : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="text-[13px] font-medium leading-tight">
                          {m.title}
                        </p>
                        <MangelStatusBadge status={m.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {relativeZeit(m.created_at)}
                        {m.reporter && <> · {m.reporter}</>}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ListCard>

        <ListCard
          title="Letzte Einreichungen"
          subtitle="Krankmeldung, Urlaub, Schadensmeldungen."
          allHref="/admin/formulare/eingaenge"
        >
          {submissions.length === 0 ? (
            <EmptyState
              title="Noch keine Einreichungen"
              description="Sobald jemand ein Formular abschickt, taucht es hier auf."
            />
          ) : (
            <ul className="divide-y divide-border">
              {submissions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/admin/formulare/eingaenge/${s.id}`}
                    className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)]"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="text-[13px] font-medium leading-tight">
                          {s.template_title ?? "Formular"}
                        </p>
                        <SubmissionPill status={s.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {relativeZeit(s.submitted_at)}
                        {s.submitter && <> · {s.submitter}</>}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ListCard>
      </section>

      {/* Zuletzt aktiv — vollbreite Section */}
      <section>
        <ListCard
          title="Zuletzt aktiv"
          subtitle="Wer hat zuletzt eine Lektion geöffnet."
          allHref="/admin/fortschritt"
        >
          {mitarbeiter.length === 0 ? (
            <EmptyState
              title="Noch keine Aktivität"
              description="Sobald ein Mitarbeiter eine Lektion öffnet, taucht er hier auf."
            />
          ) : (
            <ul className="divide-y divide-border">
              {mitarbeiter.map((m) => (
                <li key={m.user_id}>
                  <Link
                    href={`/admin/benutzer/${m.user_id}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)] sm:px-5"
                  >
                    <ColoredAvatar name={m.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-tight">
                        {m.full_name ?? "—"}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {relativeZeit(m.last_seen_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ListCard>
      </section>

      {/* Stammdaten — Foot-Banner: kompakte Zahlen-Reihe */}
      <section className="rounded-xl border border-border bg-card px-3 py-3 sm:px-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Stammdaten
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
          <Stamm
            icon={<Users className="h-3.5 w-3.5" />}
            label="Mitarbeiter"
            wert={puls.mitarbeiter}
            href="/admin/benutzer"
          />
          <Stamm
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Lernpfade"
            wert={puls.lernpfade}
            href="/admin/lernpfade"
          />
          <Stamm
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Lektionen heute"
            wert={puls.lektionenHeute}
            href="/admin/fortschritt"
          />
          <Stamm
            icon={<Activity className="h-3.5 w-3.5" />}
            label="Aktiv 30T"
            wert={puls.aktiveDieseWoche}
            href="/admin/fortschritt"
          />
        </div>
      </section>
    </div>
  );
}

function ListCard({
  title,
  subtitle,
  allHref,
  children,
}: {
  title: string;
  subtitle: string;
  allHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-end justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href={allHref}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--brand-pink))] hover:underline"
        >
          Alle <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function Stamm({
  icon,
  label,
  wert,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  wert: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background group-hover:text-[hsl(var(--brand-pink))]">
        {icon}
      </span>
      <span className="text-[15px] font-bold leading-none tabular-nums">
        {wert}
      </span>
      <span className="truncate text-[11px] text-muted-foreground">
        {label}
      </span>
    </Link>
  );
}

function SubmissionPill({ status }: { status: string }) {
  if (status === "eingereicht")
    return (
      <StatusPill ton="primary" dot>
        {SUBMISSION_LABEL[status]}
      </StatusPill>
    );
  if (status === "in_bearbeitung")
    return <StatusPill ton="warn">{SUBMISSION_LABEL[status]}</StatusPill>;
  if (status === "erledigt")
    return <StatusPill ton="success">{SUBMISSION_LABEL[status]}</StatusPill>;
  return <StatusPill ton="neutral">{SUBMISSION_LABEL[status]}</StatusPill>;
}

