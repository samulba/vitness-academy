"use client";

import { Frown, Meh, Smile } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  FEEDBACK_KATEGORIEN,
  kategorieLabel,
  type Feedback,
  type Sentiment,
} from "@/lib/feedback-types";
import { formatDatum } from "@/lib/format";

const SENTIMENT_META: Record<
  Sentiment,
  { icon: typeof Smile; label: string; tint: string }
> = {
  positive: {
    icon: Smile,
    label: "Positiv",
    tint: "bg-emerald-500/15 text-emerald-700",
  },
  neutral: {
    icon: Meh,
    label: "Neutral",
    tint: "bg-zinc-500/15 text-zinc-700",
  },
  negative: {
    icon: Frown,
    label: "Negativ",
    tint: "bg-rose-500/15 text-rose-700",
  },
};

export function FeedbackTable({ feedback }: { feedback: Feedback[] }) {
  const columns: Column<Feedback>[] = [
    {
      key: "sentiment",
      label: "Sentiment",
      sortable: true,
      render: (f) => {
        const meta = SENTIMENT_META[f.sentiment];
        const Icon = meta.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tint}`}
          >
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "feedback_text",
      label: "Feedback",
      render: (f) => (
        <div className="max-w-md">
          <p className="line-clamp-2 text-sm">{f.feedback_text}</p>
          {f.member_name && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              — {f.member_name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Kategorie",
      sortable: true,
      render: (f) => (
        <span className="text-xs text-muted-foreground">
          {kategorieLabel(f.category)}
        </span>
      ),
    },
    {
      key: "captured_by_name",
      label: "Erfasst von",
      render: (f) => (
        <span className="text-xs text-muted-foreground">
          {f.captured_by_name ?? "—"}
        </span>
      ),
    },
    {
      key: "captured_at",
      label: "Datum",
      sortable: true,
      render: (f) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(f.captured_at)}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Feedback>
      data={feedback}
      columns={columns}
      searchable={{
        placeholder: "Feedback durchsuchen…",
        keys: ["feedback_text", "member_name"],
      }}
      filters={[
        {
          key: "sentiment",
          label: "Sentiment",
          options: [
            { value: "positive", label: "Positiv" },
            { value: "neutral", label: "Neutral" },
            { value: "negative", label: "Negativ" },
          ],
          multi: true,
        },
        {
          key: "category",
          label: "Kategorie",
          options: FEEDBACK_KATEGORIEN.map((k) => ({
            value: k.value,
            label: k.label,
          })),
          multi: true,
        },
      ]}
      defaultSort={{ key: "captured_at", direction: "desc" }}
    />
  );
}
