import { GraduationCap, ListChecks, Plus, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth";
import { ladeTemplates } from "@/lib/onboarding-templates";
import { ladeChecklistItems } from "@/lib/onboarding-checklist";
import { OnboardingTemplatesTable } from "./OnboardingTemplatesTable";
import {
  checklistItemAnlegen,
  checklistItemLoeschen,
} from "../benutzer/actions";

export default async function OnboardingTemplatesPage() {
  await requireRole(["admin", "superadmin"]);
  const [templates, checklistItems] = await Promise.all([
    ladeTemplates(),
    ladeChecklistItems(null),
  ]);

  const totalPfade = templates.reduce((s, t) => s + t.lernpfad_count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mitarbeiter"
        title="Onboarding-Templates"
        description="Vordefinierte Sets aus Rolle + Lernpfaden — beim Anlegen neuer Mitarbeiter:innen wählst du das passende Template aus und alles ist vor-konfiguriert."
        primaryAction={{
          label: "Neues Template",
          icon: <Plus />,
          href: "/admin/onboarding-templates/neu",
        }}
      />

      <StatGrid cols={3}>
        <StatCard
          label="Templates"
          value={templates.length}
          icon={<Sparkles />}
        />
        <StatCard
          label="Lernpfade vorgesehen"
          value={totalPfade}
          icon={<GraduationCap />}
        />
        <StatCard
          label="Checklist-Items"
          value={checklistItems.length}
          icon={<ListChecks />}
        />
      </StatGrid>

      {/* Onboarding-Checklisten (Standard-Items) */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">
            <ListChecks className="mr-2 inline h-4 w-4 text-[hsl(var(--brand-pink))]" />
            Standard-Checklist
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Items, die bei jedem neuen Mitarbeiter:innen-Eintritt angezeigt
            werden. &bdquo;Schlüssel ausgehändigt&ldquo;, &bdquo;Hygieneplan
            unterschrieben&ldquo;, &bdquo;erste Theke-Schicht begleitet&ldquo;
            usw. Studioleitung hakt sie auf der Mitarbeiter-Detailseite ab.
          </p>
        </header>
        <form
          action={checklistItemAnlegen}
          className="grid gap-3 sm:grid-cols-[2fr_3fr_1fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              required
              placeholder='z.B. „Schlüssel ausgehändigt"'
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="beschreibung">
              Beschreibung
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="beschreibung"
              name="beschreibung"
              placeholder="Detail-Info, was zu prüfen ist"
              className="h-10 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sort_order">Reihenfolge</Label>
            <Input
              id="sort_order"
              name="sort_order"
              inputMode="numeric"
              defaultValue={String((checklistItems.at(-1)?.sort_order ?? 0) + 10)}
              className="h-10 rounded-lg"
            />
          </div>
          <Button
            type="submit"
            className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Plus className="h-4 w-4" />
            Anlegen
          </Button>
        </form>

        {checklistItems.length > 0 && (
          <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
            {checklistItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.beschreibung && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.beschreibung}
                    </p>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  #{item.sort_order}
                </span>
                <form action={checklistItemLoeschen.bind(null, item.id)}>
                  <button
                    type="submit"
                    className="text-muted-foreground/60 transition-colors hover:text-destructive"
                    aria-label="Item entfernen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Templates"
            description='Lege ein erstes Template an — z.B. „Trainer-Onboarding" mit den 4 wichtigsten Lernpfaden.'
            actions={[
              {
                icon: <Plus />,
                title: "Erstes Template anlegen",
                description: "Name, Rolle, Lernpfade auswählen",
                href: "/admin/onboarding-templates/neu",
              },
            ]}
          />
        </div>
      ) : (
        <OnboardingTemplatesTable templates={templates} />
      )}
    </div>
  );
}
