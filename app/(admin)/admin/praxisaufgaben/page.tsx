import Link from "next/link";
import { CheckSquare, Clock, Plus, ThumbsDown, ThumbsUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { alsArray, istNextJsControlFlow, joinTitel } from "@/lib/admin/safe-loader";
import { PraxisaufgabenTable, type Zeile } from "./PraxisaufgabenTable";

async function ladeAufgaben(): Promise<Zeile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("practical_tasks")
      .select(
        `id, title, status, updated_at, sort_order,
         learning_paths:learning_path_id ( title ),
         lessons:lesson_id ( title ),
         user_practical_signoffs ( status )`,
      )
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[ladeAufgaben] supabase error:", error);
      return [];
    }

    type Roh = {
      id?: string;
      title?: string;
      status?: string;
      updated_at?: string;
      learning_paths?: unknown;
      lessons?: unknown;
      user_practical_signoffs?: unknown;
    };

    return ((data ?? []) as unknown as Roh[])
      .filter((t) => typeof t.id === "string" && typeof t.title === "string")
      .map((t) => {
        const sos = alsArray<{ status?: string }>(t.user_practical_signoffs);
        return {
          id: t.id as string,
          title: t.title as string,
          status: typeof t.status === "string" ? t.status : "aktiv",
          pfad_titel: joinTitel(t.learning_paths),
          lektion_titel: joinTitel(t.lessons),
          bereit: sos.filter((s) => s?.status === "bereit").length,
          freigegeben: sos.filter((s) => s?.status === "freigegeben").length,
          abgelehnt: sos.filter((s) => s?.status === "abgelehnt").length,
          updated_at:
            typeof t.updated_at === "string"
              ? t.updated_at
              : new Date().toISOString(),
        };
      });
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeAufgaben] unexpected error:", e);
    return [];
  }
}

export default async function AdminPraxisaufgabenPage() {
  const aufgaben = await ladeAufgaben();
  const aktiv = aufgaben.filter((a) => a.status === "aktiv").length;
  const wartetSumme = aufgaben.reduce((s, a) => s + a.bereit, 0);
  const freigegebenSumme = aufgaben.reduce((s, a) => s + a.freigegeben, 0);
  const abgelehntSumme = aufgaben.reduce((s, a) => s + a.abgelehnt, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inhalte"
        title="Praxisaufgaben"
        description="Vorlagen für Praxisfreigaben. Anfragen freigeben/ablehnen findest du unter Studio-Daten · Anfragen."
        primaryAction={{
          label: "Neue Aufgabe",
          icon: <Plus />,
          href: "/admin/praxisaufgaben/neu",
        }}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Aufgaben gesamt"
          value={aufgaben.length}
          icon={<CheckSquare />}
        />
        <StatCard label="Wartet auf Freigabe" value={wartetSumme} icon={<Clock />} />
        <StatCard label="Freigegeben" value={freigegebenSumme} icon={<ThumbsUp />} />
        <StatCard label="Abgelehnt" value={abgelehntSumme} icon={<ThumbsDown />} />
      </StatGrid>

      {aufgaben.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Praxisaufgaben"
            description="Lege eine erste Praxisaufgabe an, die Mitarbeiter aktiv abschließen müssen."
            actions={[
              {
                icon: <Plus />,
                title: "Aufgabe anlegen",
                description: "Pfad/Lektion verknüpfen",
                href: "/admin/praxisaufgaben/neu",
              },
            ]}
          />
        </div>
      ) : (
        <PraxisaufgabenTable aufgaben={aufgaben} />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv} aktiv. Tipp: Mitarbeiter-Anfragen findest du unter{" "}
        <Link
          href="/admin/praxisfreigaben"
          className="font-medium text-foreground hover:underline"
        >
          Studio-Daten · Anfragen
        </Link>
        .
      </p>
    </div>
  );
}
