import Link from "next/link";
import { AlertTriangle, Pin, Sparkles, TrendingUp } from "lucide-react";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { type Announcement } from "@/lib/infos-types";
import { type InfoStats } from "@/lib/infos";

function relativeZeit(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const std = Math.floor(min / 60);
  if (std < 24) return `vor ${std} Std`;
  const tage = Math.floor(std / 24);
  return `vor ${tage} Tg`;
}

export function StatsSidebar({
  angepinnt,
  stats,
}: {
  angepinnt: Announcement[];
  stats: InfoStats;
}) {
  return (
    <div className="space-y-4">
      {angepinnt.length > 0 && (
        <SidebarCard
          icon={<Pin className="h-3.5 w-3.5" />}
          title="Angepinnt"
        >
          <ul className="space-y-3">
            {angepinnt.slice(0, 3).map((a) => (
              <li key={a.id}>
                <p className="line-clamp-2 text-[13px] font-medium leading-snug">
                  {a.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {a.author_name ?? "Studio"} · {relativeZeit(a.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </SidebarCard>
      )}

      <SidebarCard
        icon={<TrendingUp className="h-3.5 w-3.5" />}
        title="Diese Woche"
      >
        <dl className="space-y-3">
          <StatRow
            label="Infos gepostet"
            wert={stats.posts_diese_woche}
          />
          <StatRow
            label="Dringende Meldungen"
            wert={stats.dringende_diese_woche}
            akzent={
              stats.dringende_diese_woche > 0 ? "text-red-500" : undefined
            }
            icon={
              stats.dringende_diese_woche > 0 ? (
                <AlertTriangle className="h-3 w-3" />
              ) : null
            }
          />
        </dl>

        {stats.aktivste_person && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Aktivste Person
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <ColoredAvatar
                name={stats.aktivste_person.name}
                avatarPath={stats.aktivste_person.avatar_path}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {stats.aktivste_person.name ?? "Unbekannt"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats.aktivste_person.posts}{" "}
                  {stats.aktivste_person.posts === 1 ? "Post" : "Posts"}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarCard>

      {stats.letzte_aktivitaeten.length > 0 && (
        <SidebarCard
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title="Team-Aktivität"
        >
          <ul className="space-y-3">
            {stats.letzte_aktivitaeten.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/infos`}
                  className="flex items-start gap-2.5 transition-opacity hover:opacity-80"
                >
                  <ColoredAvatar
                    name={a.author_name}
                    avatarPath={a.avatar_path}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[13px] leading-snug">
                      <span className="font-medium">
                        {a.author_name ?? "Jemand"}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        — {a.title}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {relativeZeit(a.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </SidebarCard>
      )}
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
