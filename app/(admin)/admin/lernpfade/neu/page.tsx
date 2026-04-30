import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { lernpfadAnlegen } from "../actions";

export default function NeuerLernpfadPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Lernpfade", href: "/admin/lernpfade" },
          { label: "Neu" },
        ]}
        eyebrow="Lernpfad"
        title="Neuer Lernpfad"
        description="Lege Titel und Beschreibung an. Module und Lektionen folgen auf der Detailseite."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Stammdaten
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Status &bdquo;Entwurf&ldquo; bedeutet, dass Mitarbeiter den Lernpfad noch nicht
            sehen.
          </p>
        </div>
        <form action={lernpfadAnlegen} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" required maxLength={150} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue="aktiv"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px]"
            >
              <option value="entwurf">Entwurf</option>
              <option value="aktiv">Aktiv</option>
              <option value="archiviert">Archiviert</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button asChild variant="ghost">
              <Link href="/admin/lernpfade">Abbrechen</Link>
            </Button>
            <SpeichernButton label="Lernpfad anlegen" />
          </div>
        </form>
      </div>
    </div>
  );
}
