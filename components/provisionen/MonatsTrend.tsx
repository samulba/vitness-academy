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
import { formatEuro, type MonatStat } from "@/lib/provisionen-types";

const MONATE_KURZ = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];

function monatKurz(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  return `${MONATE_KURZ[m - 1]} ${String(y).slice(2)}`;
}

export function MonatsTrend({
  daten,
  modus = "provision",
}: {
  daten: MonatStat[];
  modus?: "provision" | "abschluesse";
}) {
  const dataset = daten.map((d) => ({
    label: monatKurz(d.monat),
    wert: modus === "provision" ? d.provision : d.abschluesse,
    monat: d.monat,
  }));

  const max = dataset.reduce((s, d) => Math.max(s, d.wert), 0);
  if (max === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        Noch keine Daten — die Kurve wächst, sobald Abschlüsse genehmigt sind.
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataset}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(v) =>
              modus === "provision"
                ? `${Math.round(v / 100) / 10}k`
                : String(v)
            }
            width={32}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--primary)/0.05)" }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => {
              const n = typeof value === "number" ? value : Number(value) || 0;
              return [
                modus === "provision" ? formatEuro(n) : `${n} Abschlüsse`,
                modus === "provision" ? "Provision" : "Abschlüsse",
              ];
            }}
            labelFormatter={(label) => label}
          />
          <Bar
            dataKey="wert"
            fill="hsl(var(--brand-pink))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
