import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Cake,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Inbox,
  ListTodo,
  Sparkles,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import { ladeGeburtstageNaechste } from "@/lib/mitarbeiter-stammdaten";
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
  const [puls, maengel, submissions, mitarbeiter, geburtstage] = await Promise.all([
    ladePuls(),
    ladeAktiveMaengel(),
    ladeFrischeSubmissions(),
    ladeAktiveMitarbeiter(),
    ladeGeburtstageNaechste(14),
  ]);

  const todoSumme =
    puls.maengelOffen + puls.submissionsOffen + puls.aufgabenOffen;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verwaltung"
        title="Studio-Puls"
        description="Was ist heute im Studio los — Mängel, Einreichungen, Aktivität, Aufgaben. Alles in einer Sicht."
      />

      <StatGrid cols={4}>
        <StatCard
          label="Mängel offen"
          value={puls.maengelOffen}
          icon={<AlertTriangle />}
          trend={
            puls.maengelHeute > 0
              ? {
                  value: puls.maengelHeute,
                  direction: "up",
                  hint: "heute neu gemeldet",
                }
              : undefined
          }
          href="/admin/maengel"
        />
        <StatCard
          label="Einreichungen offen"
          value={puls.submissionsOffen}
          icon={<Inbox />}
          trend={
            puls.submissionsHeute > 0
              ? {
                  value: puls.submissionsHeute,
                  direction: "up",
                  hint: "heute eingegangen",
                }
              : undefined
          }
          href="/admin/formulare/eingaenge"
        />
        <StatCard
          label="Aufgaben offen"
          value={puls.aufgabenOffen}
          icon={<ListTodo />}
          href="/admin/aufgaben"
        />
        <StatCard
          label="Aktiv diese Woche"
          value={puls.aktiveDieseWoche}
          icon={<Sparkles />}
          trend={
            puls.lektionenHeute > 0
              ? {
                  value: puls.lektionenHeute,
                  direction: "up",
                  hint: "Lektionen heute",
                }
              : undefined
          }
          href="/admin/fortschritt"
        />
      </StatGrid>

      {/* Geburtstage in den nächsten 14 Tagen */}
      {geburtstage.length > 0 && (
        <section className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <Cake className="h-4 w-4 text-[hsl(var(--brand-pink))]" />
              <h2 className="text-sm font-semibold tracking-tight">
                Geburtstage
              </h2>
              <span className="text-[11px] text-muted-foreground">
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
                className="flex items-center gap-3 px-5 py-2.5"
              >
                <ColoredAvatar name={g.full_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {g.full_name ?? "—"}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      wird {g.alter_neu}
                    </span>
                  </p>
                </div>
                <span className="rounded-full bg-[hsl(var(--brand-pink)/0.08)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--brand-pink))]">
                  {g.tage_bis === 0
                    ? "🎂 heute"
                    : g.tage_bis === 1
                      ? "morgen"
                      : `in ${g.tage_bis} Tagen`}
                </span>
                <span className="text-[11px] text-muted-foreground">
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

      {/* Zwei-Spalten: Aktivität + Stammdaten */}
      <section className="grid gap-4 lg:grid-cols-2">
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
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)]"
                  >
                    <ColoredAvatar name={m.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-tight">
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

        <div className="rounded-xl border border-border bg-card p-5">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Stammdaten
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Inhalte und Mitarbeiter im System.
            </p>
          </header>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <Stamm
              icon={<Users className="h-3.5 w-3.5" />}
              label="Mitarbeiter"
              wert={puls.mitarbeiter}
              href="/admin/benutzer"
            />
            <Stamm
              icon={<GraduationCap className="h-3.5 w-3.5" />}
              label="Aktive Lernpfade"
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
              label="Aktive Mitarbeiter"
              wert={puls.aktiveDieseWoche}
              href="/admin/fortschritt"
            />
          </div>
        </div>
      </section>

      <p className="text-[11px] text-muted-foreground">
        Offene ToDos gesamt:{" "}
        <span
          className={
            todoSumme === 0
              ? "font-semibold text-[hsl(var(--success))]"
              : "font-semibold text-[hsl(var(--brand-pink))]"
          }
        >
          {todoSumme}
        </span>
      </p>
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
      className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:border-[hsl(var(--brand-pink)/0.4)] hover:bg-secondary"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground transition-colors group-hover:text-[hsl(var(--brand-pink))]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[18px] font-semibold leading-none tracking-tight tabular-nums">
          {wert}
        </p>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {label}
        </p>
      </div>
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

