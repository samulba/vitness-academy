"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Pie-Chart für Quiz-Auswertung: Bestanden vs Nicht bestanden.
 * Brand-Magenta-Sättigung als Farben.
 */
export function QuizBestehensquoteChart({
  bestanden,
  nichtBestanden,
}: {
  bestanden: number;
  nichtBestanden: number;
}) {
  const data = [
    { name: "Bestanden", value: bestanden },
    { name: "Nicht bestanden", value: nichtBestanden },
  ];
  const COLORS = ["hsl(331 70% 42%)", "hsl(0 0% 85%)"];
  const total = bestanden + nichtBestanden;

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Noch keine Versuche.
      </div>
    );
  }

  return (
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums">
            {Math.round((bestanden / total) * 100)}%
          </p>
          <p className="text-[11px] text-muted-foreground">Bestanden</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontaler Bar-Chart pro Frage mit Korrektquote in %.
 * Zeigt die schwierigsten Fragen (niedrigste Quote) zuerst.
 */
export function QuizFragenChart({
  fragen,
}: {
  fragen: { prompt: string; korrektquote: number; versuche: number }[];
}) {
  const data = [...fragen]
    .filter((f) => f.versuche > 0)
    .sort((a, b) => a.korrektquote - b.korrektquote)
    .slice(0, 8)
    .map((f, i) => ({
      // Kurzer Label für YAxis: max ~32 Zeichen
      label: `${i + 1}. ${f.prompt.length > 32 ? f.prompt.slice(0, 30) + "…" : f.prompt}`,
      korrekt: f.korrektquote,
      versuche: f.versuche,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Noch keine Antworten.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 4, left: 12 }}
      >
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
          axisLine={false}
          tickLine={false}
          width={210}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [`${value}% korrekt`, ""]}
        />
        <Bar
          dataKey="korrekt"
          fill="hsl(var(--brand-pink))"
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
