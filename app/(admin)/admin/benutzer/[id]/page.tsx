import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  GraduationCap,
  MapPin,
  Plus,
  Star,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { createClient } from "@/lib/supabase/server";
import { ladeMeineLernpfade } from "@/lib/lernpfade";
import { mitarbeiterQuizVerlauf } from "@/lib/quiz_stats";
import { ladeAktivitaetsMap } from "@/lib/lektion";
import { AktivitaetsHeatmap } from "@/components/charts/AktivitaetsHeatmap";
import { requireRole } from "@/lib/auth";
import { formatDatum, formatProzent, rolleLabel } from "@/lib/format";
import {
  lernpfadEntziehen,
  lernpfadZuweisen,
  mitarbeiterArchivieren,
  mitarbeiterReaktivieren,
  profilAktualisieren,
  standortAlsPrimary,
  standortEntfernen,
  standortHinzufuegen,
} from "../actions";

type Profil = {
  id: string;
  full_name: string | null;
  role: string;
  location_id: string | null;
  kann_provisionen: boolean;
  created_at: string;
  archived_at: string | null;
  email: string | null;
};

async function ladeProfil(id: string): Promise<Profil | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, location_id, kann_provisionen, created_at, archived_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  // Email kommt aus auth.users (per RLS nicht verfuegbar) -> ohne Email
  return {
    id: data.id as string,
    full_name: data.full_name as string | null,
    role: data.role as string,
    location_id: data.location_id as string | null,
    kann_provisionen: Boolean(data.kann_provisionen),
    created_at: data.created_at as string,
    archived_at: data.archived_at as string | null,
    email: null,
  };
}

async function ladeStandorte() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("id, name")
    .order("name", { ascending: true });
  return (data ?? []) as { id: string; name: string }[];
}

async function ladeMemberships(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_locations")
    .select(
      `is_primary, location_id,
       locations:location_id ( id, name )`,
    )
    .eq("user_id", userId);
  type Roh = {
    is_primary: boolean;
    location_id: string;
    locations: { id: string; name: string } | null;
  };
  return ((data ?? []) as unknown as Roh[])
    .filter((r) => r.locations)
    .map((r) => ({
      location_id: r.location_id,
      name: r.locations!.name,
      is_primary: r.is_primary,
    }))
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.name.localeCompare(b.name, "de");
    });
}

async function ladeAlleLernpfade() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select("id, title")
    .order("sort_order", { ascending: true });
  return (data ?? []) as { id: string; title: string }[];
}

async function ladeZuweisungen(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_learning_path_assignments")
    .select(
      `id, assigned_at,
       learning_paths:learning_path_id ( id, title )`,
    )
    .eq("user_id", userId)
    .order("assigned_at", { ascending: false });

  type Roh = {
    id: string;
    assigned_at: string;
    learning_paths: { id: string; title: string } | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((a) => ({
    id: a.id,
    assigned_at: a.assigned_at,
    pfad_id: a.learning_paths?.id ?? null,
    pfad_title: a.learning_paths?.title ?? "—",
  }));
}

export default async function BenutzerBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aktuell = await requireRole(["admin", "superadmin"]);

  const [
    profil,
    standorte,
    alleLernpfade,
    zuweisungen,
    fortschritt,
    memberships,
  ] = await Promise.all([
    ladeProfil(id),
    ladeStandorte(),
    ladeAlleLernpfade(),
    ladeZuweisungen(id),
    ladeMeineLernpfade(id),
    ladeMemberships(id),
  ]);

  const quizVerlauf = await mitarbeiterQuizVerlauf(id, 10);
  const aktivitaetsMap = await ladeAktivitaetsMap(id);

  if (!profil) notFound();

  const zugewieseneIds = new Set(zuweisungen.map((z) => z.pfad_id));
  const verfuegbareLernpfade = alleLernpfade.filter(
    (p) => !zugewieseneIds.has(p.id),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Mitarbeiter", href: "/admin/benutzer" },
          { label: profil.full_name ?? "Mitarbeiter" },
        ]}
        eyebrow="Mitarbeiter"
        title={profil.full_name ?? "Mitarbeiter"}
        description={`${rolleLabel(profil.role)} · Angelegt am ${formatDatum(profil.created_at)}`}
        meta={
          profil.archived_at ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Archive className="h-3 w-3" />
              archiviert seit {formatDatum(profil.archived_at)}
            </span>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>
            Anzeigename, Rolle und Standort.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={profilAktualisieren.bind(null, profil.id)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="full_name">Anzeigename</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profil.full_name ?? ""}
                placeholder="Vor- und Nachname"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue={profil.role}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="mitarbeiter">Mitarbeiter</option>
                  <option value="fuehrungskraft">Führungskraft</option>
                  <option value="admin">Admin</option>
                  {aktuell.role === "superadmin" ? (
                    <option value="superadmin">Superadmin</option>
                  ) : null}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_id">Standort</Label>
                <select
                  id="location_id"
                  name="location_id"
                  defaultValue={profil.location_id ?? ""}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">— ohne —</option>
                  {standorte.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-[hsl(var(--primary))] has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.06)]">
              <input
                type="checkbox"
                name="kann_provisionen"
                defaultChecked={profil.kann_provisionen}
                className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Vertriebsrolle (Provisionen)
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Mitarbeiter:in sieht die Provisionen-Section in der Sidebar
                  und darf Abschlüsse eintragen.
                </span>
              </span>
            </label>

            <div className="flex justify-end">
              <SpeichernButton />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Standort-Mitgliedschaften</CardTitle>
          <CardDescription>
            Studios in denen diese:r Mitarbeiter:in Inhalte sieht. Das mit
            dem Stern ist das Heim-Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {memberships.length === 0 ? (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Aktuell in keinem Studio Mitglied.
            </p>
          ) : (
            <ul className="space-y-2">
              {memberships.map((m) => (
                <li
                  key={m.location_id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{m.name}</span>
                    {m.is_primary && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                        <Star className="h-2.5 w-2.5" />
                        Heim
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!m.is_primary && (
                      <form
                        action={standortAlsPrimary.bind(
                          null,
                          profil.id,
                          m.location_id,
                        )}
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Star className="h-3 w-3" />
                          Als Heim setzen
                        </button>
                      </form>
                    )}
                    <form
                      action={standortEntfernen.bind(
                        null,
                        profil.id,
                        m.location_id,
                      )}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                        Entfernen
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {standorte.filter(
            (s) => !memberships.some((m) => m.location_id === s.id),
          ).length > 0 && (
            <form
              action={standortHinzufuegen.bind(null, profil.id)}
              className="flex items-end gap-2 border-t border-border pt-4"
            >
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="add_location_id"
                  className="text-[11px] uppercase tracking-wider text-muted-foreground"
                >
                  Standort hinzufügen
                </Label>
                <select
                  id="add_location_id"
                  name="location_id"
                  defaultValue=""
                  required
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="" disabled>
                    Standort wählen…
                  </option>
                  {standorte
                    .filter(
                      (s) => !memberships.some((m) => m.location_id === s.id),
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              <Button type="submit" variant="outline" className="gap-1">
                <Plus className="h-4 w-4" />
                Hinzufügen
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lernpfad-Zuweisungen</CardTitle>
          <CardDescription>
            Welche Lernpfade dieser Mitarbeiter sehen soll.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {zuweisungen.length === 0 ? (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Aktuell sind keine Lernpfade zugewiesen.
            </p>
          ) : (
            <ul className="space-y-2">
              {zuweisungen.map((z) => (
                <li
                  key={z.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="font-medium">{z.pfad_title}</span>
                    <span className="text-xs text-muted-foreground">
                      seit {formatDatum(z.assigned_at)}
                    </span>
                  </div>
                  <LoeschenButton
                    action={lernpfadEntziehen.bind(null, profil.id, z.id)}
                    label="Zuweisung entfernen"
                    bestaetigung="Zuweisung wirklich entfernen? Fortschritt bleibt erhalten."
                  />
                </li>
              ))}
            </ul>
          )}

          {verfuegbareLernpfade.length > 0 ? (
            <form
              action={lernpfadZuweisen.bind(null, profil.id)}
              className="flex flex-wrap items-end gap-2 pt-2"
            >
              <div className="flex-1 min-w-[200px] space-y-1">
                <Label htmlFor="learning_path_id">Lernpfad zuweisen</Label>
                <select
                  id="learning_path_id"
                  name="learning_path_id"
                  required
                  defaultValue=""
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Lernpfad wählen …</option>
                  {verfuegbareLernpfade.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4" />
                Zuweisen
              </Button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              Alle vorhandenen Lernpfade sind bereits zugewiesen.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fortschritt</CardTitle>
          <CardDescription>
            Pro zugewiesenem Lernpfad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fortschritt.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Lernpfade zugewiesen.
            </p>
          ) : (
            <div className="space-y-3">
              {fortschritt.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{p.title}</span>
                      <Badge variant="outline">
                        {p.abgeschlossen}/{p.gesamt} Lektionen
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">
                      {formatProzent(p.prozent)}
                    </span>
                  </div>
                  <Progress value={p.prozent} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aktivitaets-Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Lern-Aktivität</CardTitle>
          <CardDescription>
            Abgeschlossene Lektionen pro Tag, letzte 12 Monate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AktivitaetsHeatmap
            data={aktivitaetsMap}
            beschriftung="abgeschlossene Lektionen"
          />
        </CardContent>
      </Card>

      {/* Quiz-Verlauf */}
      {quizVerlauf.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz-Verlauf</CardTitle>
            <CardDescription>Letzte 10 abgeschlossene Versuche.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {quizVerlauf.map((v) => (
                <li
                  key={v.attempt_id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/quizze/${v.quiz_id}/auswertung`}
                      className="font-medium hover:underline"
                    >
                      {v.quiz_title ?? "Quiz"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {v.completed_at && formatDatum(v.completed_at)}
                    </p>
                  </div>
                  <span
                    className={
                      v.passed
                        ? "rounded-full bg-[hsl(var(--success)/0.15)] px-2.5 py-0.5 text-xs font-bold text-[hsl(var(--success))]"
                        : "rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive"
                    }
                  >
                    {v.score} %
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Archivieren / Reaktivieren */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base">
            {profil.archived_at ? "Mitarbeiter reaktivieren" : "Mitarbeiter archivieren"}
          </CardTitle>
          <CardDescription>
            {profil.archived_at
              ? "Login wird wieder erlaubt, der Mitarbeiter taucht wieder in der Standard-Liste auf."
              : "Der Mitarbeiter kann sich nicht mehr einloggen, alle Daten (Audit, Quizversuche, Praxis) bleiben aber erhalten. Statt loeschen empfohlen."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profil.archived_at ? (
            <form action={mitarbeiterReaktivieren.bind(null, profil.id)}>
              <Button type="submit" size="sm">
                <ArchiveRestore className="h-4 w-4" />
                Reaktivieren
              </Button>
            </form>
          ) : (
            <LoeschenButton
              action={mitarbeiterArchivieren.bind(null, profil.id)}
              label="Mitarbeiter archivieren"
              bestaetigung={`"${profil.full_name ?? "Mitarbeiter"}" wirklich archivieren? Login wird sofort gesperrt.`}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
