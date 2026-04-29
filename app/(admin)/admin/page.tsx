import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
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
import { formatDatum } from "@/lib/format";
import { MangelStatusBadge } from "@/components/maengel/StatusBadge";

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeekIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Mo=0
  d.setDate(d.getDate() - day);
  return d.toISOString();
}

async function ladePuls() {
  const supabase = await createClient();
  const heute = startOfTodayIso();
  const woche = startOfWeekIso();

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
    .select(
      "user_id, last_seen_at, profile:user_id ( full_name )",
    )
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

const SUBMISSION_PILL_CLASS: Record<string, string> = {
  eingereicht:
    "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
  in_bearbeitung: "bg-amber-100 text-amber-700",
  erledigt: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
  abgelehnt: "bg-muted text-muted-foreground",
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
  const [puls, maengel, submissions, mitarbeiter] = await Promise.all([
    ladePuls(),
    ladeAktiveMaengel(),
    ladeFrischeSubmissions(),
    ladeAktiveMitarbeiter(),
  ]);

  const jetzt = new Date();
  const wochentag = jetzt.toLocaleDateString("de-DE", { weekday: "long" });
  const datumLang = jetzt.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todoSumme =
    puls.maengelOffen + puls.submissionsOffen + puls.aufgabenOffen;

  return (
    <div className="space-y-8">
      {/* Hero-Header mit Magenta-Gradient + Live-Indicator */}
      <section className="relative overflow-hidden rounded-2xl border border-[hsl(var(--brand-pink)/0.3)] bg-card">
        {/* Aurora-Hintergrund */}
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-90"
          style={{
            background:
              "radial-gradient(80% 60% at 0% 0%, hsl(var(--brand-pink)/0.18) 0%, transparent 60%), radial-gradient(60% 80% at 100% 100%, hsl(var(--primary)/0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-6 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
                <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--brand-pink))] opacity-70" />
                  <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-pink))]" />
                </span>
                Live · {wochentag}, {datumLang}
              </p>
              <h1 className="mt-3 text-balance text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                Studio-Puls
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Was ist heute im Studio los — Mängel, Einreichungen,
                Aktivität, Aufgaben. Alles in einer Sicht.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Offene ToDos
              </p>
              <p
                className={`text-4xl font-semibold tabular-nums tracking-tight ${
                  todoSumme === 0
                    ? "text-[hsl(var(--success))]"
                    : "text-[hsl(var(--brand-pink))]"
                }`}
              >
                {todoSumme}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Mängel + Einreichungen + Aufgaben
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Heute-Leiste */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PulsKachel
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Mängel offen"
          wert={puls.maengelOffen}
          delta={puls.maengelHeute > 0 ? `+${puls.maengelHeute} heute` : null}
          accent={puls.maengelOffen > 0 ? "warn" : "default"}
          href="/admin/maengel"
        />
        <PulsKachel
          icon={<Inbox className="h-4 w-4" />}
          label="Einreichungen offen"
          wert={puls.submissionsOffen}
          delta={
            puls.submissionsHeute > 0
              ? `+${puls.submissionsHeute} heute`
              : null
          }
          accent={puls.submissionsOffen > 0 ? "pink" : "default"}
          href="/admin/formulare/eingaenge"
        />
        <PulsKachel
          icon={<ListTodo className="h-4 w-4" />}
          label="Aufgaben offen"
          wert={puls.aufgabenOffen}
          accent="default"
          href="/admin/aufgaben"
        />
        <PulsKachel
          icon={<Sparkles className="h-4 w-4" />}
          label="Aktiv diese Woche"
          wert={puls.aktiveDieseWoche}
          delta={
            puls.lektionenHeute > 0
              ? `${puls.lektionenHeute} Lektion${puls.lektionenHeute === 1 ? "" : "en"} heute`
              : null
          }
          accent="success"
          href="/admin/fortschritt"
        />
      </section>

      {/* Zwei-Spalten: Mängel + Einreichungen */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Aktive Mängel */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Aktive Mängel
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Was gerade nicht funktioniert.
              </p>
            </div>
            <Link
              href="/admin/maengel"
              className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--brand-pink))] hover:underline"
            >
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {maengel.length > 0 ? (
            <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              {maengel.map((m, i) => (
                <li
                  key={m.id}
                  className={i > 0 ? "border-t border-border" : ""}
                >
                  <Link
                    href={`/admin/maengel/${m.id}`}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <span
                      className={
                        m.severity === "kritisch"
                          ? "mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500"
                          : m.severity === "normal"
                          ? "mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500"
                          : "mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40"
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="font-semibold leading-tight">
                          {m.title}
                        </p>
                        <MangelStatusBadge status={m.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {relativeZeit(m.created_at)}
                        {m.reporter && <> · {m.reporter}</>}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Aktuell keine offenen Mängel.
            </div>
          )}
        </div>

        {/* Letzte Einreichungen */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Letzte Einreichungen
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Krankmeldung, Urlaub, Schadensmeldungen.
              </p>
            </div>
            <Link
              href="/admin/formulare/eingaenge"
              className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--brand-pink))] hover:underline"
            >
              Alle <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {submissions.length > 0 ? (
            <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              {submissions.map((s, i) => (
                <li
                  key={s.id}
                  className={i > 0 ? "border-t border-border" : ""}
                >
                  <Link
                    href={`/admin/formulare/eingaenge/${s.id}`}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="font-semibold leading-tight">
                          {s.template_title ?? "Formular"}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            SUBMISSION_PILL_CLASS[s.status] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {SUBMISSION_LABEL[s.status] ?? s.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {relativeZeit(s.submitted_at)}
                        {s.submitter && <> · {s.submitter}</>}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Noch keine Einreichungen.
            </div>
          )}
        </div>
      </section>

      {/* Zwei-Spalten: Aktivität + Stammdaten */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Zuletzt aktiv */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Zuletzt aktiv
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Wer hat zuletzt eine Lektion geöffnet.
              </p>
            </div>
            <Link
              href="/admin/fortschritt"
              className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--brand-pink))] hover:underline"
            >
              Fortschritt <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {mitarbeiter.length > 0 ? (
            <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
              {mitarbeiter.map((m, i) => (
                <li
                  key={m.user_id}
                  className={i > 0 ? "border-t border-border" : ""}
                >
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.12)] text-xs font-semibold text-[hsl(var(--brand-pink))]">
                      {(m.full_name ?? "?")
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase())
                        .join("") || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight">
                        {m.full_name ?? "—"}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {relativeZeit(m.last_seen_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Noch keine Aktivität.
            </div>
          )}
        </div>

        {/* Stammdaten */}
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Stammdaten</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Inhalte und Mitarbeiter im System.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StammdatenKachel
              icon={<Users className="h-4 w-4" />}
              label="Mitarbeiter"
              wert={puls.mitarbeiter}
              href="/admin/benutzer"
            />
            <StammdatenKachel
              icon={<GraduationCap className="h-4 w-4" />}
              label="Aktive Lernpfade"
              wert={puls.lernpfade}
              href="/admin/lernpfade"
            />
            <StammdatenKachel
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Lektionen heute"
              wert={puls.lektionenHeute}
              href="/admin/fortschritt"
            />
            <StammdatenKachel
              icon={<Activity className="h-4 w-4" />}
              label="Aktive Mitarbeiter"
              wert={puls.aktiveDieseWoche}
              href="/admin/fortschritt"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PulsKachel({
  icon,
  label,
  wert,
  delta,
  accent,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  wert: number;
  delta?: string | null;
  accent: "default" | "warn" | "pink" | "success";
  href: string;
}) {
  const accentClass =
    accent === "warn"
      ? "bg-amber-100 text-amber-700"
      : accent === "pink"
      ? "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]"
      : accent === "success"
      ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
      : "bg-muted text-muted-foreground";

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--brand-pink)/0.4)] hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClass}`}
        >
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--brand-pink))]" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{wert}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {delta && (
        <p className="mt-2 text-xs font-medium text-[hsl(var(--brand-pink))]">
          {delta}
        </p>
      )}
    </Link>
  );
}

function StammdatenKachel({
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
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[hsl(var(--brand-pink)/0.4)]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-[hsl(var(--brand-pink)/0.12)] group-hover:text-[hsl(var(--brand-pink))]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-semibold leading-none tracking-tight">
          {wert}
        </p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}
