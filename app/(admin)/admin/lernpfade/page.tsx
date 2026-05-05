import {
  GraduationCap,
  Layers,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import {
  EmptyState,
  EmptyStateTablePreview,
} from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { alsArray, istNextJsControlFlow } from "@/lib/admin/safe-loader";
import { LernpfadeTable, type Zeile } from "./LernpfadeTable";

async function ladeLernpfade(): Promise<Zeile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("learning_paths")
      .select(
        `id, title, status, updated_at, sort_order, hero_image_path,
         modules ( id, lessons ( id ) ),
         user_learning_path_assignments ( id )`,
      )
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("[ladeLernpfade] supabase error:", error);
      return [];
    }

    type Roh = {
      id?: string;
      title?: string;
      status?: string;
      updated_at?: string;
      hero_image_path?: string | null;
      modules?: unknown;
      user_learning_path_assignments?: unknown;
    };

    return ((data ?? []) as unknown as Roh[])
      .filter((p) => typeof p.id === "string" && typeof p.title === "string")
      .map((p) => {
        const moduleListe = alsArray<{ id: string; lessons?: unknown }>(p.modules);
        const lektionAnzahl = moduleListe.reduce(
          (s, m) => s + alsArray(m.lessons).length,
          0,
        );
        return {
          id: p.id as string,
          title: p.title as string,
          status: typeof p.status === "string" ? p.status : "aktiv",
          module_anzahl: moduleListe.length,
          lektion_anzahl: lektionAnzahl,
          zugewiesen: alsArray(p.user_learning_path_assignments).length,
          updated_at:
            typeof p.updated_at === "string"
              ? p.updated_at
              : new Date().toISOString(),
          hero_image_path:
            typeof p.hero_image_path === "string" ? p.hero_image_path : null,
        };
      });
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeLernpfade] unexpected error:", e);
    return [];
  }
}

export default async function AdminLernpfadeListe() {
  const pfade = await ladeLernpfade();
  const aktiv = pfade.filter((p) => p.status === "aktiv").length;
  const lektionenSumme = pfade.reduce((s, p) => s + p.lektion_anzahl, 0);
  const moduleSumme = pfade.reduce((s, p) => s + p.module_anzahl, 0);
  const zuweisungenSumme = pfade.reduce((s, p) => s + p.zugewiesen, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inhalte"
        title="Lernpfade"
        description="Reihenfolge bestimmt die Anzeige im Mitarbeiter-Bereich."
        primaryAction={{
          label: "Neuer Lernpfad",
          icon: <Plus />,
          href: "/admin/lernpfade/neu",
        }}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Lernpfade"
          value={pfade.length}
          icon={<GraduationCap />}
        />
        <StatCard label="Module gesamt" value={moduleSumme} icon={<Layers />} />
        <StatCard
          label="Lektionen gesamt"
          value={lektionenSumme}
          icon={<Pencil />}
        />
        <StatCard
          label="Zuweisungen"
          value={zuweisungenSumme}
          icon={<Users />}
        />
      </StatGrid>

      {pfade.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Lernpfade"
            description="Lege deinen ersten Lernpfad an. Module und Lektionen baust du dann auf der Detailseite."
            actions={[
              {
                icon: <Plus />,
                title: "Lernpfad anlegen",
                description: "Mit Modulen und Lektionen",
                href: "/admin/lernpfade/neu",
              },
              {
                icon: <Layers />,
                title: "Inhalte aus Notion",
                description: "Markdown-Import via CLI",
                href: "/admin/wissen",
              },
              {
                icon: <Users />,
                title: "Mitarbeiter zuweisen",
                description: "Lernpfade zu Personen",
                href: "/admin/benutzer",
              },
            ]}
          />
        </div>
      ) : (
        <LernpfadeTable pfade={pfade} />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv === pfade.length
          ? "Alle Lernpfade sind aktiv und werden Mitarbeitern angezeigt."
          : `${aktiv} von ${pfade.length} aktiv.`}
      </p>
    </div>
  );
}
