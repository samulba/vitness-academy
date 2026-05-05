import { ExternalLink, Folder, BookOpen, Pencil, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { createClient } from "@/lib/supabase/server";
import { alsArray, joinFeld } from "@/lib/admin/safe-loader";
import { formatDatum } from "@/lib/format";
import {
  kategorieAktualisieren,
  kategorieAnlegen,
  kategorieLoeschen,
} from "./actions";

type Artikel = {
  id: string;
  title: string;
  slug: string;
  category_name: string | null;
  status: string;
  updated_at: string;
};

type Kategorie = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  artikel_anzahl: number;
};

async function ladeArtikel(): Promise<Artikel[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select(
        `id, title, slug, status, updated_at, sort_order,
         knowledge_categories:category_id ( name )`,
      )
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.error("[ladeArtikel] supabase error:", error);
      return [];
    }

    type Roh = {
      id?: string;
      title?: string;
      slug?: string;
      status?: string;
      updated_at?: string;
      knowledge_categories?: unknown;
    };
    return ((data ?? []) as unknown as Roh[])
      .filter((a) => typeof a.id === "string" && typeof a.title === "string")
      .map((a) => ({
        id: a.id as string,
        title: a.title as string,
        slug: typeof a.slug === "string" ? a.slug : "",
        status: typeof a.status === "string" ? a.status : "aktiv",
        updated_at:
          typeof a.updated_at === "string"
            ? a.updated_at
            : new Date().toISOString(),
        category_name: joinFeld(a.knowledge_categories, "name"),
      }));
  } catch (e) {
    console.error("[ladeArtikel] unexpected error:", e);
    return [];
  }
}

async function ladeKategorien(): Promise<Kategorie[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("knowledge_categories")
      .select(`id, name, slug, description, sort_order, knowledge_articles ( id )`)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("[ladeKategorien] supabase error:", error);
      return [];
    }
    type Roh = {
      id?: string;
      name?: string;
      slug?: string;
      description?: string | null;
      knowledge_articles?: unknown;
    };
    return ((data ?? []) as unknown as Roh[])
      .filter((k) => typeof k.id === "string" && typeof k.name === "string")
      .map((k) => ({
        id: k.id as string,
        name: k.name as string,
        slug: typeof k.slug === "string" ? k.slug : "",
        description: typeof k.description === "string" ? k.description : null,
        artikel_anzahl: alsArray(k.knowledge_articles).length,
      }));
  } catch (e) {
    console.error("[ladeKategorien] unexpected error:", e);
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv")
    return (
      <StatusPill ton="success" dot>
        Aktiv
      </StatusPill>
    );
  if (status === "entwurf") return <StatusPill ton="warn">Entwurf</StatusPill>;
  return <StatusPill ton="neutral">Archiviert</StatusPill>;
}

export default async function AdminWissenPage() {
  const [artikel, kategorien] = await Promise.all([
    ladeArtikel(),
    ladeKategorien(),
  ]);
  const aktiv = artikel.filter((a) => a.status === "aktiv").length;
  const ohneKategorie = artikel.filter((a) => !a.category_name).length;

  const columns: Column<Artikel>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (a) => (
        <span className="font-medium text-foreground">{a.title}</span>
      ),
    },
    {
      key: "category_name",
      label: "Kategorie",
      sortable: true,
      render: (a) =>
        a.category_name ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Folder className="h-3 w-3" />
            {a.category_name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "updated_at",
      label: "Aktualisiert",
      sortable: true,
      render: (a) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(a.updated_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inhalte"
        title="Handbuch"
        description="Kategorien strukturieren das Handbuch, Artikel sind die einzelnen Inhalte."
        primaryAction={{
          label: "Neuer Artikel",
          icon: <Plus />,
          href: "/admin/wissen/neu",
        }}
      />

      <StatGrid cols={3}>
        <StatCard
          label="Artikel gesamt"
          value={artikel.length}
          icon={<BookOpen />}
        />
        <StatCard
          label="Kategorien"
          value={kategorien.length}
          icon={<Folder />}
        />
        <StatCard
          label="Ohne Kategorie"
          value={ohneKategorie}
          icon={<Pencil />}
        />
      </StatGrid>

      {/* Kategorien als ausklappbare Liste */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight">
              Kategorien ({kategorien.length})
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Slug landet in der URL. Klick auf eine Kategorie zum Bearbeiten.
            </p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {kategorien.map((k) => (
            <details key={k.id} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40">
                <div className="flex min-w-0 items-center gap-3">
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[14px] font-medium">{k.name}</span>
                  <StatusPill ton="neutral">
                    {k.artikel_anzahl} Artikel
                  </StatusPill>
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    /{k.slug}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground/60 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div className="border-t border-border bg-muted/20 px-5 py-4">
                <form
                  action={kategorieAktualisieren.bind(null, k.id)}
                  className="space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`name-${k.id}`}>Name</Label>
                      <Input
                        id={`name-${k.id}`}
                        name="name"
                        defaultValue={k.name}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`slug-${k.id}`}>Slug</Label>
                      <Input
                        id={`slug-${k.id}`}
                        name="slug"
                        defaultValue={k.slug}
                        placeholder="leer = auto"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`desc-${k.id}`}>Beschreibung</Label>
                    <Input
                      id={`desc-${k.id}`}
                      name="description"
                      defaultValue={k.description ?? ""}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <LoeschenButton
                      action={kategorieLoeschen.bind(null, k.id)}
                      label="Kategorie löschen"
                      bestaetigung="Kategorie wirklich löschen? Artikel bleiben erhalten, verlieren aber die Kategorie."
                    />
                    <SpeichernButton label="Speichern" />
                  </div>
                </form>
              </div>
            </details>
          ))}
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground">
              <Plus className="h-3.5 w-3.5" />
              Neue Kategorie
            </summary>
            <div className="border-t border-border bg-muted/20 px-5 py-4">
              <form action={kategorieAnlegen} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="kat-name">Name</Label>
                    <Input id="kat-name" name="name" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="kat-slug">Slug (optional)</Label>
                    <Input
                      id="kat-slug"
                      name="slug"
                      placeholder="leer = aus Name generieren"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kat-desc">Beschreibung</Label>
                  <Input id="kat-desc" name="description" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary">
                    <Plus />
                    Kategorie anlegen
                  </Button>
                </div>
              </form>
            </div>
          </details>
        </div>
      </div>

      {/* Artikel-Tabelle */}
      {artikel.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Artikel"
            description="Lege deinen ersten Wissensartikel an. Markdown-Body mit Headlines, Listen und Links."
            actions={[
              {
                icon: <Plus />,
                title: "Artikel anlegen",
                description: "Markdown-Editor",
                href: "/admin/wissen/neu",
              },
              {
                icon: <Folder />,
                title: "Kategorie zuerst",
                description: "Struktur planen",
                onClick: () => {},
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<Artikel>
          data={artikel}
          columns={columns}
          searchable={{ placeholder: "Artikel suchen…", keys: ["title"] }}
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "aktiv", label: "Aktiv" },
                { value: "entwurf", label: "Entwurf" },
                { value: "archiviert", label: "Archiviert" },
              ],
              multi: true,
            },
            {
              key: "category_name",
              label: "Kategorie",
              options: kategorien.map((k) => ({
                value: k.name,
                label: k.name,
              })),
            },
          ]}
          rowHref={(a) => `/admin/wissen/${a.id}`}
          rowActions={[
            {
              icon: <ExternalLink />,
              label: "Vorschau",
              href: (a) => `/wissen/${a.slug}`,
            },
            {
              icon: <Pencil />,
              label: "Bearbeiten",
              href: (a) => `/admin/wissen/${a.id}`,
            },
          ]}
          defaultSort={{ key: "title", direction: "asc" }}
        />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv} von {artikel.length} Artikel aktiv.
      </p>
    </div>
  );
}
