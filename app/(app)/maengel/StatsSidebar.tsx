import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import type { MangelStats } from "@/lib/maengel";

export function StatsSidebar({ stats }: { stats: MangelStats }) {
  return (
    <div className="space-y-4">
      <SidebarCard
        icon={<Clock className="h-3.5 w-3.5" />}
        title="Aktuell"
      >
        <dl className="space-y-3">
          <StatRow label="Offen" wert={stats.offen} />
          <StatRow
            label="In Bearbeitung"
            wert={stats.in_bearbeitung}
            akzent={stats.in_bearbeitung > 0 ? "text-amber-600" : undefined}
          />
        </dl>
      </SidebarCard>

      <SidebarCard
        icon={<TrendingUp className="h-3.5 w-3.5" />}
        title="Diese Woche"
      >
        <dl className="space-y-3">
          <StatRow
            label="Gemeldet"
            wert={stats.gemeldet_diese_woche}
            icon={<AlertTriangle className="h-3 w-3" />}
          />
          <StatRow
            label="Behoben"
            wert={stats.behoben_diese_woche}
            akzent={
              stats.behoben_diese_woche > 0 ? "text-[hsl(var(--success))]" : undefined
            }
            icon={<CheckCircle2 className="h-3 w-3" />}
          />
        </dl>

        {stats.aktivster_melder && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Meiste Meldungen
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <ColoredAvatar
                name={stats.aktivster_melder.name}
                avatarPath={stats.aktivster_melder.avatar_path}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {stats.aktivster_melder.name ?? "Unbekannt"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats.aktivster_melder.posts}{" "}
                  {stats.aktivster_melder.posts === 1
                    ? "Meldung"
                    : "Meldungen"}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarCard>
    </div>
  );
}

function SidebarCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function StatRow({
  label,
  wert,
  akzent,
  icon,
}: {
  label: string;
  wert: number;
  akzent?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd
        className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${akzent ?? ""}`}
      >
        {icon}
        {wert}
      </dd>
    </div>
  );
}
