import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { StatusPill } from "@/components/admin/StatusPill";
import {
  AdminActionCell,
  AdminTable,
  AdminTableEmpty,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTitleCell,
  AdminTr,
} from "@/components/admin/AdminTable";
import { createClient } from "@/lib/supabase/server";
import { formatDatum } from "@/lib/format";
import {
  artikelReihenfolge,
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_articles")
    .select(
      `id, title, slug, status, updated_at,
       knowledge_categories:category_id ( name )`,
    )
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    slug: string;
    status: string;
    updated_at: string;
    knowledge_categories: { name: string } | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
    updated_at: a.updated_at,
    category_name: a.knowledge_categories?.name ?? null,
  }));
}

async function ladeKategorien(): Promise<Kategorie[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_categories")
    .select(`id, name, slug, description, knowledge_articles ( id )`)
    .order("sort_order", { ascending: true });
  type Roh = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    knowledge_articles: { id: string }[] | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((k) => ({
    id: k.id,
    name: k.name,
    slug: k.slug,
    description: k.description,
    artikel_anzahl: (k.knowledge_articles ?? []).length,
  }));
}

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv") return <StatusPill ton="success">Aktiv</StatusPill>;
  if (status === "entwurf") return <StatusPill ton="warn">Entwurf</StatusPill>;
  return <StatusPill ton="neutral">Archiviert</StatusPill>;
}

export default async function AdminWissenPage() {
  const [artikel, kategorien] = await Promise.all([
    ladeArtikel(),
    ladeKategorien(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Handbuch"
        description="Kategorien strukturieren das Handbuch, Artikel sind die einzelnen Inhalte."
        actions={
          <AdminButton href="/admin/wissen/neu">
            <Plus className="h-3.5 w-3.5" />
            Neuer Artikel
          </AdminButton>
        }
      />

      <AdminCard>
        <AdminCardHeader
          title={`Kategorien (${kategorien.length})`}
          description="Slug landet in der URL. Klick auf eine Kategorie zum Bearbeiten."
        />
        <div className="divide-y divide-border">
          {kategorien.map((k) => (
            <details key={k.id} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40">
                <div className="flex min-w-0 items-center gap-3">
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
                  <AdminButton type="submit">
                    <Plus className="h-3.5 w-3.5" />
                    Kategorie anlegen
                  </AdminButton>
                </div>
              </form>
            </div>
          </details>
        </div>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader
          title={`Artikel (${artikel.length})`}
          description="Klicke einen Artikel an, um ihn zu bearbeiten."
        />
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Titel</AdminTh>
            <AdminTh>Kategorie</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Aktualisiert</AdminTh>
            <AdminTh align="right">Reihenfolge</AdminTh>
            <AdminTh align="right">Vorschau</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {artikel.length === 0 ? (
              <AdminTableEmpty colSpan={7}>
                Noch keine Artikel angelegt.
              </AdminTableEmpty>
            ) : (
              artikel.map((a, idx) => (
                <AdminTr key={a.id}>
                  <AdminTitleCell
                    href={`/admin/wissen/${a.id}`}
                    title={a.title}
                  />
                  <AdminTd className="text-xs text-muted-foreground">
                    {a.category_name ?? "—"}
                  </AdminTd>
                  <AdminTd>
                    <StatusBadge status={a.status} />
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {formatDatum(a.updated_at)}
                  </AdminTd>
                  <AdminTd align="right">
                    <div className="flex justify-end">
                      <ReihenfolgeButtons
                        hoch={artikelReihenfolge.bind(null, a.id, "hoch")}
                        runter={artikelReihenfolge.bind(null, a.id, "runter")}
                        hochDeaktiviert={idx === 0}
                        runterDeaktiviert={idx === artikel.length - 1}
                      />
                    </div>
                  </AdminTd>
                  <AdminTd align="right">
                    <Link
                      href={`/wissen/${a.slug}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                      title="Vorschau"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </AdminTd>
                  <AdminActionCell href={`/admin/wissen/${a.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
