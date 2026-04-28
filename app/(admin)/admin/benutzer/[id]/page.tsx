import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, GraduationCap, Plus } from "lucide-react";
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
import { requireRole } from "@/lib/auth";
import { formatDatum, formatProzent, rolleLabel } from "@/lib/format";
import {
  lernpfadEntziehen,
  lernpfadZuweisen,
  profilAktualisieren,
} from "../actions";

type Profil = {
  id: string;
  full_name: string | null;
  role: string;
  location_id: string | null;
  created_at: string;
  email: string | null;
};

async function ladeProfil(id: string): Promise<Profil | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, location_id, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  // Email kommt aus auth.users (per RLS nicht verfuegbar) -> ohne Email
  return {
    id: data.id as string,
    full_name: data.full_name as string | null,
    role: data.role as string,
    location_id: data.location_id as string | null,
    created_at: data.created_at as string,
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

  const [profil, standorte, alleLernpfade, zuweisungen, fortschritt] =
    await Promise.all([
      ladeProfil(id),
      ladeStandorte(),
      ladeAlleLernpfade(),
      ladeZuweisungen(id),
      ladeMeineLernpfade(id),
    ]);

  if (!profil) notFound();

  const zugewieseneIds = new Set(zuweisungen.map((z) => z.pfad_id));
  const verfuegbareLernpfade = alleLernpfade.filter(
    (p) => !zugewieseneIds.has(p.id),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/benutzer"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Benutzerliste
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          {profil.full_name ?? "Mitarbeiter"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Aktuelle Rolle: {rolleLabel(profil.role)} · Angelegt am{" "}
          {formatDatum(profil.created_at)}
        </p>
      </header>

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

            <div className="flex justify-end">
              <SpeichernButton />
            </div>
          </form>
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
    </div>
  );
}
