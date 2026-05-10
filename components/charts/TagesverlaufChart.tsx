"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TagesPunkt } from "@/lib/putzprotokoll_stats";

/**
 * Tagesverlauf der Aufgaben-Quote als Magenta-Area-Chart.
 * Tage ohne Protokoll (quote === null) werden NICHT gerendert
 * (Recharts zeichnet keine Linie über null-Werte).
 */
export function TagesverlaufChart({ data }: { data: TagesPunkt[] }) {
  const chartData = data.map((d) => ({
    datum: d.datum,
    label: d.datum.slice(8) + "." + d.datum.slice(5, 7) + ".",
    quote: d.quote === null ? null : Math.round(d.quote * 100),
  }));

  if (chartData.every((d) => d.quote === null)) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
        Keine Protokolle im Zeitraum
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-xl border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 8, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient id="tagesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="hsl(var(--brand-pink))"
                stopOpacity={0.45}
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--brand-pink))"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            stroke="hsl(var(--muted-foreground))"
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            domain={[0, 100]}
            unit="%"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              fontSize: 12,
            }}
            formatter={(value) => {
              if (value === null || value === undefined) {
                return ["Kein Protokoll", "Status"];
              }
              return [`${value}%`, "Aufgaben-Quote"];
            }}
            labelFormatter={(l, items) => {
              const f = items?.[0]?.payload as
                | (typeof chartData)[number]
                | undefined;
              return f?.datum ?? l;
            }}
          />
          <Area
            type="monotone"
            dataKey="quote"
            stroke="hsl(var(--brand-pink))"
            strokeWidth={2}
            fill="url(#tagesGradient)"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
