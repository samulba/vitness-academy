"use client";

import {
  ArrowRight,
  BookOpen,
  Download,
  Filter,
  GraduationCap,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import {
  EmptyState,
  EmptyStateTablePreview,
} from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Skeleton, SkeletonStatCard, SkeletonTableRow } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

type DemoMitarbeiter = {
  id: string;
  name: string;
  rolle: "mitarbeiter" | "fuehrungskraft" | "admin";
  standort: string;
  pfade: number;
};

const DEMO_MITARBEITER: DemoMitarbeiter[] = [
  { id: "1", name: "Lara Mustermann", rolle: "mitarbeiter", standort: "Studio Mitte", pfade: 4 },
  { id: "2", name: "Tom Schmidt", rolle: "fuehrungskraft", standort: "Studio Mitte", pfade: 6 },
  { id: "3", name: "Anna Weber", rolle: "mitarbeiter", standort: "Studio Süd", pfade: 2 },
  { id: "4", name: "Sven Becker", rolle: "admin", standort: "Studio Mitte", pfade: 6 },
  { id: "5", name: "Mira Klein", rolle: "mitarbeiter", standort: "Studio Süd", pfade: 0 },
];

export default function ShowcasePage() {
  return (
    <div className="space-y-12">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Design-Showcase" },
        ]}
        eyebrow="Internal · Dev"
        title="Design-System Showcase"
        description="Beispiel-Usage aller Komponenten der neuen Library. Diese Page ist nicht in der Sidebar verlinkt — Vorschau, bevor wir auf die echten Pages migrieren."
        primaryAction={{
          label: "Komponenten-Code",
          icon: <ArrowRight />,
          href: "https://github.com/samulba/vitness-academy/tree/main/components/ui",
        }}
        secondaryActions={[
          { icon: <Download />, label: "Export" },
          { icon: <Filter />, label: "Filter" },
        ]}
      />

      {/* 1. Button-Varianten */}
      <Section
        nummer="1"
        titel="Button-Varianten"
        beschreibung="primary / secondary / ghost / icon. Alle mit transition + active:scale-[0.98]."
      >
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6">
          <Button variant="primary">
            <Plus />
            Primary
          </Button>
          <Button variant="secondary">
            <Upload />
            Secondary
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="icon" aria-label="Bearbeiten">
            <Pencil />
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      {/* 2. PageHeader-Variants */}
      <Section
        nummer="2"
        titel="PageHeader"
        beschreibung="Breadcrumbs · Eyebrow · Title · Description · Primary + Secondary Actions. Auf jeder Admin-Seite identisch."
      >
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <PageHeader
            breadcrumbs={[
              { label: "Verwaltung", href: "/admin" },
              { label: "Mitarbeiter", href: "/admin/benutzer" },
              { label: "Lara Mustermann" },
            ]}
            eyebrow="Team"
            title="Lara Mustermann"
            description="Detailseite mit Rolle, Standort, zugewiesenen Lernpfaden und Quiz-Verlauf."
            primaryAction={{
              label: "Speichern",
              icon: <ArrowRight />,
              onClick: () => toast.success("Gespeichert"),
            }}
            secondaryActions={[
              { icon: <Trash2 />, label: "Archivieren" },
            ]}
          />
          <hr className="border-border" />
          <PageHeader
            title="Schlanke Variante"
            description="Nur Title + Description, kein Eyebrow/Breadcrumbs. Funktioniert auch."
          />
        </div>
      </Section>

      {/* 3. StatCard / StatGrid */}
      <Section
        nummer="3"
        titel="StatCard mit Sparkline"
        beschreibung="Label oben · grosse Zahl · Trend-Badge · Recharts AreaChart als Sparkline."
      >
        <StatGrid cols={4}>
          <StatCard
            label="Aktive Mitarbeiter"
            value={42}
            icon={<Users />}
            trend={{ value: 12, direction: "up", hint: "vs. letzte Woche" }}
            sparklineData={[28, 30, 32, 34, 36, 39, 42]}
            href="/admin/benutzer"
          />
          <StatCard
            label="Neu diese Woche"
            value={3}
            icon={<Sparkles />}
            trend={{ value: 50, direction: "up" }}
            sparklineData={[1, 0, 1, 2, 1, 2, 3]}
          />
          <StatCard
            label="Lernpfade aktiv"
            value={4}
            icon={<GraduationCap />}
            sparklineData={[2, 3, 3, 3, 4, 4, 4]}
          />
          <StatCard
            label="Bestehensquote"
            value="78%"
            icon={<BookOpen />}
            trend={{ value: 3, direction: "down" }}
            sparklineData={[82, 81, 80, 79, 78, 78, 78]}
          />
        </StatGrid>
        <p className="mt-3 text-xs text-muted-foreground">
          Auch mit cols=2 oder cols=3 verwendbar. Ohne Sparkline kompakter.
        </p>
        <StatGrid cols={2} className="mt-3">
          <StatCard label="Ohne Sparkline" value={123} icon={<Users />} />
          <StatCard label="Nur Wert" value="—" />
        </StatGrid>
      </Section>

      {/* 4. EmptyState */}
      <Section
        nummer="4"
        titel="EmptyState mit Quick-Action-Cards"
        beschreibung="Skeleton-Preview ueber dem Headline-Block (auf 30% Opacity), 3 Action-Cards horizontal, Hover translateY(-2px)."
      >
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Mitarbeiter"
            description="Lege jemanden manuell an oder importiere mehrere via CSV. Der erste Mitarbeiter erhaelt sofort einen Magic-Link per E-Mail."
            actions={[
              {
                icon: <Plus />,
                title: "Mitarbeiter:in anlegen",
                description: "Magic-Link per E-Mail",
                href: "/admin/benutzer/neu",
              },
              {
                icon: <Upload />,
                title: "CSV importieren",
                description: "Mehrere in einem Rutsch",
                href: "/admin/benutzer/bulk-import",
              },
              {
                icon: <BookOpen />,
                title: "Onboarding-Guide",
                description: "Wie das Setup ablaeuft",
                href: "/wissen",
              },
            ]}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Variante ohne Illustration und mit weniger Actions:
        </p>
        <div className="mt-2 rounded-xl border border-border bg-card">
          <EmptyState
            title="Keine Treffer"
            description="Ändere deine Suche oder setze die Filter zurück."
          />
        </div>
      </Section>

      {/* 5. DataTable */}
      <Section
        nummer="5"
        titel="DataTable"
        beschreibung="Toolbar (Search + Filter) · Sortable Columns · Row-Hover mit Action-Icons rechts · Empty-State integriert."
      >
        <DataTable<DemoMitarbeiter>
          data={DEMO_MITARBEITER}
          columns={
            [
              {
                key: "name",
                label: "Name",
                sortable: true,
                render: (r) => (
                  <span className="font-medium text-foreground">{r.name}</span>
                ),
              },
              {
                key: "rolle",
                label: "Rolle",
                sortable: true,
                render: (r) => (
                  <span className="capitalize text-muted-foreground">
                    {r.rolle}
                  </span>
                ),
              },
              {
                key: "standort",
                label: "Standort",
                sortable: true,
                render: (r) => (
                  <span className="text-muted-foreground">{r.standort}</span>
                ),
              },
              {
                key: "pfade",
                label: "Lernpfade",
                sortable: true,
                align: "right",
                render: (r) => (
                  <span className="tabular-nums">{r.pfade}</span>
                ),
              },
            ] as Column<DemoMitarbeiter>[]
          }
          searchable={{ placeholder: "Mitarbeiter suchen…", keys: ["name", "standort"] }}
          filters={[
            {
              key: "rolle",
              label: "Rolle",
              options: [
                { value: "mitarbeiter", label: "Mitarbeiter" },
                { value: "fuehrungskraft", label: "Führungskraft" },
                { value: "admin", label: "Admin" },
              ],
              multi: true,
            },
            {
              key: "standort",
              label: "Standort",
              options: [
                { value: "Studio Mitte", label: "Studio Mitte" },
                { value: "Studio Süd", label: "Studio Süd" },
              ],
            },
          ]}
          rowHref={(r) => `/admin/benutzer/${r.id}`}
          rowActions={[
            {
              icon: <Pencil />,
              label: "Bearbeiten",
              href: (r) => `/admin/benutzer/${r.id}`,
            },
            {
              icon: <Trash2 />,
              label: "Archivieren",
              variant: "danger",
              onClick: (r) => toast(`Würde ${r.name} archivieren`),
            },
          ]}
          defaultSort={{ key: "name", direction: "asc" }}
        />
      </Section>

      {/* 6. Skeleton */}
      <Section
        nummer="6"
        titel="Skeleton-Loader"
        beschreibung="Pulse-Animation, kein Spinner. Vorgebaute Varianten fuer typische Patterns (StatCard, TableRow)."
      >
        <div className="space-y-3">
          <StatGrid cols={4}>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </StatGrid>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <SkeletonTableRow />
            <SkeletonTableRow />
            <SkeletonTableRow />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Skeleton variant="circle" className="h-9 w-9" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-48" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </Section>

      {/* 7. Toast */}
      <Section
        nummer="7"
        titel="Toast-Notifications"
        beschreibung="Slide-in von oben rechts via sonner. Success, Error, Info, Loading & Promise."
      >
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-6">
          <Button
            variant="secondary"
            onClick={() => toast.success("Standort angelegt")}
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error("Speichern fehlgeschlagen", {
                description: "Netzwerkfehler — bitte erneut versuchen.",
              })
            }
          >
            Error
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info("Magic-Link verschickt", {
                description: "lara@example.com",
              })
            }
          >
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const id = toast.loading("Importiere CSV …");
              setTimeout(
                () => toast.success("12 Mitarbeiter importiert", { id }),
                1500,
              );
            }}
          >
            Loading → Success
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  nummer,
  titel,
  beschreibung,
  children,
}: {
  nummer: string;
  titel: string;
  beschreibung: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <header className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
          {nummer}
        </span>
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight">{titel}</h2>
          <p className="text-[13px] text-muted-foreground">{beschreibung}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
