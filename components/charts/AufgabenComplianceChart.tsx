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

import type { BereichCompliance } from "@/lib/putzprotokoll_stats";

type Datum = {
  bereich: string;
  /** Compliance in % (0..100). -1 wenn keine Daten → unten als 0 dargestellt */
  quote: number;
  total: number;
  erledigt: number;
};

/**
 * BarChart der Aufgaben-Compliance pro Bereich (Magenta).
 * Y-Axis fix 0..100. Tooltip zeigt absolut "X / Y erledigt".
 */
export function AufgabenComplianceChart({
  data,
}: {
  data: BereichCompliance[];
}) {
  const chartData: Datum[] = data.map((d) => ({
    bereich: shortenLabel(d.titel),
    quote: d.quote >= 0 ? Math.round(d.quote * 100) : 0,
    total: d.total,
    erledigt: d.erledigt,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
        Keine Daten im Zeitraum
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-xl border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 8, bottom: 12, left: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="bereich"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            unit="%"
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
              const d = item.payload as Datum;
              return [`${v}% · ${d.erledigt} / ${d.total}`, "Compliance"];
            }}
          />
          <Bar
            dataKey="quote"
            fill="hsl(var(--brand-pink))"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function shortenLabel(s: string): string {
  // Lange Bereich-Titel kuerzen damit X-Axis nicht ueberlaeuft
  if (s.length <= 22) return s;
  return s.slice(0, 20) + "…";
}
