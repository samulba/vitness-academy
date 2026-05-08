"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TopVergessen } from "@/lib/putzprotokoll_stats";

/**
 * Horizontaler BarChart "Top vergessene Aufgaben". Liste sortiert
 * nach Haeufigkeit (haeufigster oben). Magenta-Bars.
 */
export function TopVergessenChart({ data }: { data: TopVergessen[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
        Keine Daten — alle Aufgaben wurden im Zeitraum erledigt 🎉
      </div>
    );
  }

  // Recharts horizontal: layout="vertical", X = Wert, Y = Kategorie.
  const chartData = data.map((d) => ({
    label: d.aufgabe.length > 38 ? d.aufgabe.slice(0, 36) + "…" : d.aufgabe,
    bereich: d.bereich,
    anzahl: d.anzahl,
    full: d.aufgabe,
  }));

  return (
    <div
      className="w-full rounded-xl border border-border bg-card p-4"
      style={{ height: Math.max(280, data.length * 36 + 60) }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            type="category"
            dataKey="label"
            width={220}
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--brand-pink) / 0.08)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              fontSize: 12,
            }}
            formatter={(value, _name, item) => {
              const v = typeof value === "number" ? value : 0;
              const d = item.payload as (typeof chartData)[number];
              return [`${v}×`, d.bereich];
            }}
            labelFormatter={(_l, items) => {
              const f = items?.[0]?.payload as
                | (typeof chartData)[number]
                | undefined;
              return f?.full ?? "";
            }}
          />
          <Bar
            dataKey="anzahl"
            fill="hsl(var(--brand-pink))"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
