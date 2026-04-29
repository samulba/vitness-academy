"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

export type StatTrend = {
  value: number; // z.B. 12 oder -3
  direction: "up" | "down";
  /** Optionaler Label-Text neben dem Prozent (z.B. "vs. letzte Woche") */
  hint?: string;
};

/**
 * KPI-Karte fuer Stats-Strips. Linear/Vercel-Style:
 * label oben (12px uppercase muted) -> grosser Wert (32px/600) ->
 * Trend-Badge in einer Reihe -> Sparkline (40px hoch, kein Achs/Grid).
 *
 * Bg ist leicht getintet (bg-secondary), nicht reines Weiss -- der Layer-
 * Kontrast zur Page erzeugt Tiefe. Hover hebt den Magenta-Border-Hint
 * hervor.
 *
 * "trend.direction" up/down bestimmt das Badge-Icon und die Farbe:
 *   up   = success
 *   down = destructive
 *
 * "sparklineData" akzeptiert ein einfaches Number-Array (juengste Werte
 * zuletzt). Recharts rendert eine Magenta-Area mit transparentem Fill.
 *
 * @example
 *   <StatCard
 *     label="Aktive Mitarbeiter"
 *     value={42}
 *     icon={<Users />}
 *     trend={{ value: 12, direction: "up", hint: "vs. letzte Woche" }}
 *     sparklineData={[12, 15, 18, 22, 27, 35, 42]}
 *   />
 */
export function StatCard({
  label,
  value,
  trend,
  sparklineData,
  icon,
  href,
  className,
}: {
  label: string;
  value: string | number;
  trend?: StatTrend;
  sparklineData?: number[];
  icon?: React.ReactNode;
  /** Wenn gesetzt, wird die ganze Karte zum Link */
  href?: string;
  className?: string;
}) {
  const inhalt = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {icon && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-background text-muted-foreground [&_svg]:size-3.5">
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[32px] font-semibold leading-none tracking-tight tabular-nums">
          {value}
        </p>
        {trend && <TrendBadge trend={trend} />}
      </div>

      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-3 -mx-1 h-10">
          <Sparkline data={sparklineData} direction={trend?.direction ?? "up"} />
        </div>
      )}
    </>
  );

  const baseClass = cn(
    "relative flex flex-col rounded-xl border border-border bg-secondary/50 p-4",
    "transition-all duration-150",
    href &&
      "hover:border-[hsl(var(--brand-pink)/0.4)] hover:bg-secondary hover:shadow-sm active:scale-[0.99]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {inhalt}
      </Link>
    );
  }
  return <div className={baseClass}>{inhalt}</div>;
}

function TrendBadge({ trend }: { trend: StatTrend }) {
  const ist = trend.direction === "up";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        ist
          ? "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]"
          : "bg-destructive/10 text-destructive",
      )}
      title={trend.hint}
    >
      {ist ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(trend.value)}%
    </span>
  );
}

function Sparkline({
  data,
  direction,
}: {
  data: number[];
  direction: "up" | "down";
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  const stroke =
    direction === "down"
      ? "hsl(var(--destructive))"
      : "hsl(var(--brand-pink))";
  const gradId = `spark-${direction}-${data.length}`;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.75}
          fill={`url(#${gradId})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Container fuer eine Reihe von StatCards. Nimmt auf 1/2/4 Spalten
 * verteilen, je nach Breite. Verwende, wenn du mehrere KPIs hintereinander
 * zeigst -- alleinstehende Karte braucht keinen Wrapper.
 */
export function StatGrid({
  children,
  cols = 4,
  className,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const colClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={cn("grid gap-3", colClass, className)}>{children}</div>
  );
}
