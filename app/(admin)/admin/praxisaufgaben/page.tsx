import Link from "next/link";
import { Plus } from "lucide-react";
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
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
import { aufgabeReihenfolge } from "./actions";

type Zeile = {
  id: string;
  title: string;
  status: string;
  pfad_titel: string | null;
  lektion_titel: string | null;
  bereit: number;
  freigegeben: number;
  abgelehnt: number;
  updated_at: string;
};

async function ladeAufgaben(): Promise<Zeile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("practical_tasks")
    .select(
      `id, title, status, updated_at,
       learning_paths:learning_path_id ( title ),
       lessons:lesson_id ( title ),
       user_practical_signoffs ( status )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    status: string;
    updated_at: string;
    learning_paths: { title: string } | null;
    lessons: { title: string } | null;
    user_practical_signoffs: { status: string }[] | null;
  };

  return ((data ?? []) as unknown as Roh[]).map((t) => {
    const sos = t.user_practical_signoffs ?? [];
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      pfad_titel: t.learning_paths?.title ?? null,
      lektion_titel: t.lessons?.title ?? null,
      bereit: sos.filter((s) => s.status === "bereit").length,
      freigegeben: sos.filter((s) => s.status === "freigegeben").length,
      abgelehnt: sos.filter((s) => s.status === "abgelehnt").length,
      updated_at: t.updated_at,
    };
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv") return <StatusPill ton="success">Aktiv</StatusPill>;
  if (status === "entwurf") return <StatusPill ton="warn">Entwurf</StatusPill>;
  return <StatusPill ton="neutral">Archiviert</StatusPill>;
}

export default async function AdminPraxisaufgabenPage() {
  const aufgaben = await ladeAufgaben();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Praxisaufgaben"
        description="Vorlagen für Praxisfreigaben. Anfragen freigeben/ablehnen findest du unter Studio-Daten · Anfragen."
        actions={
          <AdminButton href="/admin/praxisaufgaben/neu">
            <Plus className="h-3.5 w-3.5" />
            Neue Aufgabe
          </AdminButton>
        }
      />

      <AdminCard>
        <AdminTable>
          <AdminTableHead>
            <AdminTh>Titel</AdminTh>
            <AdminTh>Bindung</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh align="right">Wartet</AdminTh>
            <AdminTh align="right">Freigegeben</AdminTh>
            <AdminTh align="right">Abgelehnt</AdminTh>
            <AdminTh align="right">Reihenfolge</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {aufgaben.length === 0 ? (
              <AdminTableEmpty colSpan={8}>
                Noch keine Praxisaufgaben angelegt.
              </AdminTableEmpty>
            ) : (
              aufgaben.map((a, idx) => (
                <AdminTr key={a.id}>
                  <AdminTitleCell
                    href={`/admin/praxisaufgaben/${a.id}`}
                    title={a.title}
                    subtitle={
                      [a.pfad_titel, a.lektion_titel]
                        .filter(Boolean)
                        .join(" · ") || undefined
                    }
                  />
                  <AdminTd className="text-xs text-muted-foreground">
                    {a.pfad_titel ?? "—"}
                  </AdminTd>
                  <AdminTd>
                    <StatusBadge status={a.status} />
                  </AdminTd>
                  <AdminTd
                    align="right"
                    className="tabular-nums text-[hsl(var(--brand-pink))]"
                  >
                    {a.bereit}
                  </AdminTd>
                  <AdminTd
                    align="right"
                    className="tabular-nums text-[hsl(var(--success))]"
                  >
                    {a.freigegeben}
                  </AdminTd>
                  <AdminTd
                    align="right"
                    className="tabular-nums text-muted-foreground"
                  >
                    {a.abgelehnt}
                  </AdminTd>
                  <AdminTd align="right">
                    <div className="flex justify-end">
                      <ReihenfolgeButtons
                        hoch={aufgabeReihenfolge.bind(null, a.id, "hoch")}
                        runter={aufgabeReihenfolge.bind(null, a.id, "runter")}
                        hochDeaktiviert={idx === 0}
                        runterDeaktiviert={idx === aufgaben.length - 1}
                      />
                    </div>
                  </AdminTd>
                  <AdminActionCell href={`/admin/praxisaufgaben/${a.id}`} />
                </AdminTr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>

      <p className="text-xs text-muted-foreground">
        Tipp: Mitarbeiter-Anfragen findest du unter{" "}
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
