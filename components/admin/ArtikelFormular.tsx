import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpeichernButton } from "@/components/admin/SpeichernButton";

type Kategorie = { id: string; name: string };

type Werte = {
  title?: string;
  slug?: string;
  summary?: string | null;
  body?: string;
  status?: string;
  category_id?: string | null;
};

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ArtikelFormular({
  action,
  kategorien,
  werte,
  modus,
}: {
  action: (formData: FormData) => Promise<void> | void;
  kategorien: Kategorie[];
  werte?: Werte;
  modus: "anlegen" | "bearbeiten";
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={werte?.title ?? ""}
          placeholder="z.B. Was tun, wenn die Mitgliedskarte nicht funktioniert?"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={werte?.slug ?? ""}
            placeholder="leer = aus Titel generieren"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={werte?.status ?? "aktiv"}
            className={SELECT_CLASS}
          >
            <option value="entwurf">Entwurf</option>
            <option value="aktiv">Aktiv</option>
            <option value="archiviert">Archiviert</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category_id">Kategorie</Label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={werte?.category_id ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">Keine Kategorie</option>
          {kategorien.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="summary">Kurzbeschreibung</Label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={werte?.summary ?? ""}
          className={TEXTAREA_CLASS}
          placeholder="Optional, taucht in der Artikelliste auf."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Inhalt (Markdown)</Label>
        <textarea
          id="body"
          name="body"
          rows={16}
          defaultValue={werte?.body ?? ""}
          className={`${TEXTAREA_CLASS} font-mono`}
          placeholder="## Überschrift&#10;&#10;**Wichtig**: Markdown mit GitHub-Flavor wird unterstützt."
        />
      </div>

      <div className="flex justify-end pt-1">
        <SpeichernButton
          label={
            modus === "anlegen" ? "Artikel anlegen" : "Artikel speichern"
          }
        />
      </div>
    </form>
  );
}
