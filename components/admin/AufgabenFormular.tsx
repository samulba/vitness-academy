import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpeichernButton } from "@/components/admin/SpeichernButton";

type Pfad = { id: string; title: string };
type Modul = { id: string; title: string; learning_path_id: string };
type Lektion = { id: string; title: string; module_id: string };

type Werte = {
  title?: string;
  description?: string | null;
  status?: string;
  learning_path_id?: string | null;
  module_id?: string | null;
  lesson_id?: string | null;
};

export function AufgabenFormular({
  action,
  pfade,
  module,
  lektionen,
  werte,
  modus,
}: {
  action: (formData: FormData) => Promise<void> | void;
  pfade: Pfad[];
  module: Modul[];
  lektionen: Lektion[];
  werte?: Werte;
  modus: "anlegen" | "bearbeiten";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {modus === "anlegen"
            ? "Neue Praxisaufgabe"
            : "Praxisaufgabe bearbeiten"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={200}
              defaultValue={werte?.title ?? ""}
              placeholder="z.B. Check-in eines Mitglieds selbstständig durchführen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={werte?.description ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Was muss der Mitarbeiter konkret zeigen können?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="learning_path_id">Lernpfad (optional)</Label>
              <select
                id="learning_path_id"
                name="learning_path_id"
                defaultValue={werte?.learning_path_id ?? ""}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                {pfade.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="module_id">Modul (optional)</Label>
              <select
                id="module_id"
                name="module_id"
                defaultValue={werte?.module_id ?? ""}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                {module.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson_id">Lektion (optional)</Label>
              <select
                id="lesson_id"
                name="lesson_id"
                defaultValue={werte?.lesson_id ?? ""}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                {lektionen.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={werte?.status ?? "aktiv"}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="entwurf">Entwurf</option>
              <option value="aktiv">Aktiv</option>
              <option value="archiviert">Archiviert</option>
            </select>
          </div>

          <div className="flex justify-end">
            <SpeichernButton
              label={
                modus === "anlegen" ? "Aufgabe anlegen" : "Aufgabe speichern"
              }
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
