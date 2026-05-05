import {
  Activity,
  Plus,
  Sparkles,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { alsArray, istNextJsControlFlow, joinFeld } from "@/lib/admin/safe-loader";
import { ladeChecklistStatusBatch } from "@/lib/onboarding-checklist";
import { BenutzerTable, type Zeile } from "./BenutzerTable";

async function ladeBenutzer(includeArchiviert: boolean): Promise<Zeile[]> {
  try {
    const supabase = await createClient();
    // Erst mit tags + vertragsart (Migration 0044), dann fallback ohne
    const FELDER_VOLL = `id, full_name, role, created_at, archived_at, vertragsart, tags,
       locations:location_id ( name ),
       user_learning_path_assignments ( id )`;
    const FELDER_BASIS = `id, full_name, role, created_at, archived_at,
       locations:location_id ( name ),
       user_learning_path_assignments ( id )`;

    let q = supabase
      .from("profiles")
      .select(FELDER_VOLL)
      .order("created_at", { ascending: false });
    if (!includeArchiviert) q = q.is("archived_at", null);
    const erst = await q;
    let data: unknown = erst.data;
    if (erst.error) {
      let q2 = supabase
        .from("profiles")
        .select(FELDER_BASIS)
        .order("created_at", { ascending: false });
      if (!includeArchiviert) q2 = q2.is("archived_at", null);
      const fb = await q2;
      if (fb.error) {
        console.error("[ladeBenutzer] supabase error:", fb.error);
        return [];
      }
      data = fb.data;
    }

    type Roh = {
      id?: string;
      full_name?: string | null;
      role?: string;
      created_at?: string;
      archived_at?: string | null;
      vertragsart?: string | null;
      tags?: string[] | null;
      locations?: unknown;
      user_learning_path_assignments?: unknown;
    };

    return ((data ?? []) as unknown as Roh[])
      .filter((r) => typeof r.id === "string")
      .map((r) => ({
        id: r.id as string,
        full_name: typeof r.full_name === "string" ? r.full_name : null,
        role: typeof r.role === "string" ? r.role : "mitarbeiter",
        created_at:
          typeof r.created_at === "string"
            ? r.created_at
            : new Date().toISOString(),
        archived_at:
          typeof r.archived_at === "string" ? r.archived_at : null,
        vertragsart:
          typeof r.vertragsart === "string" ? r.vertragsart : null,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
        location_name: joinFeld(r.locations, "name"),
        zugewiesen: alsArray(r.user_learning_path_assignments).length,
        onboarding_erledigt: 0,
        onboarding_gesamt: 0,
      }));
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeBenutzer] unexpected error:", e);
    return [];
  }
}

export default async function AdminBenutzerListe({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const archivPrm = sp.archiviert;
  const showArchiv = archivPrm === "1" || archivPrm === "true";
  const benutzer = await ladeBenutzer(showArchiv);
  // Onboarding-Status pro Mitarbeiter:in mergen (defensiv: bei
  // fehlender Migration leerer Map -> Werte bleiben 0/0)
  const onboardingMap = await ladeChecklistStatusBatch(
    benutzer.map((b) => b.id),
  );
  for (const b of benutzer) {
    const s = onboardingMap.get(b.id);
    if (s) {
      b.onboarding_erledigt = s.erledigt;
      b.onboarding_gesamt = s.gesamt;
    }
  }
  const aktive = benutzer.filter((b) => !b.archived_at).length;
  const archiviert = benutzer.filter((b) => b.archived_at).length;

  const wocheGrenze = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const neueDieseWoche = benutzer.filter(
    (b) => !b.archived_at && new Date(b.created_at) >= wocheGrenze,
  ).length;
  const mitPfaden = benutzer.filter(
    (b) => !b.archived_at && b.zugewiesen > 0,
  ).length;
  const fuehrungAnzahl = benutzer.filter(
    (b) =>
      !b.archived_at &&
      ["fuehrungskraft", "admin", "superadmin"].includes(b.role),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mitarbeiter"
        title="Mitarbeiter"
        description="Rollen, Standorte und Lernpfad-Zuweisungen pflegst du über die Detailseite."
        primaryAction={{
          label: "Neue:r Mitarbeiter:in",
          icon: <Plus />,
          href: "/admin/benutzer/neu",
        }}
        secondaryActions={[
          {
            icon: <Upload />,
            label: "CSV importieren",
            href: "/admin/benutzer/bulk-import",
          },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Aktive Mitarbeiter"
          value={aktive}
          icon={<Users />}
        />
        <StatCard
          label="Neu diese Woche"
          value={neueDieseWoche}
          icon={<UserPlus />}
          trend={
            neueDieseWoche > 0
              ? { value: neueDieseWoche, direction: "up", hint: "letzte 7 Tage" }
              : undefined
          }
        />
        <StatCard
          label="Mit Lernpfaden"
          value={`${mitPfaden}/${aktive}`}
          icon={<Sparkles />}
        />
        <StatCard
          label="Führung & Admin"
          value={fuehrungAnzahl}
          icon={<Activity />}
        />
      </StatGrid>

      {benutzer.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title={
              showArchiv ? "Keine Mitarbeiter gefunden" : "Noch keine Mitarbeiter"
            }
            description="Lege jemanden manuell an oder importiere mehrere via CSV. Der erste Mitarbeiter erhält sofort einen Magic-Link per E-Mail."
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
            ]}
          />
        </div>
      ) : (
        <BenutzerTable benutzer={benutzer} />
      )}

      <p className="text-[11px] text-muted-foreground">
        {showArchiv
          ? `${aktive} aktiv · ${archiviert} archiviert`
          : `${aktive} aktive Mitarbeiter`}
        {!showArchiv && archiviert === 0 && benutzer.length === 0 ? null : (
          <>
            {" · "}
            <a
              href={
                showArchiv ? "/admin/benutzer" : "/admin/benutzer?archiviert=1"
              }
              className="underline-offset-2 hover:underline"
            >
              {showArchiv ? "Nur aktive" : "Auch archivierte zeigen"}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
