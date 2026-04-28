import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { lernpfadAnlegen } from "../actions";

export default function NeuerLernpfadPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/lernpfade"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Liste
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Neuer Lernpfad
        </h1>
        <p className="mt-1 text-muted-foreground">
          Lege Titel und Beschreibung an. Module und Lektionen folgen auf der
          Detailseite.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Stammdaten</CardTitle>
          <CardDescription>
            Status „Entwurf“ bedeutet, dass Mitarbeiter den Lernpfad noch nicht
            sehen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={lernpfadAnlegen} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" required maxLength={150} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue="aktiv"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="entwurf">Entwurf</option>
                <option value="aktiv">Aktiv</option>
                <option value="archiviert">Archiviert</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button asChild variant="ghost">
                <Link href="/admin/lernpfade">Abbrechen</Link>
              </Button>
              <SpeichernButton label="Lernpfad anlegen" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
