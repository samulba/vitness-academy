"use client";

import { useTransition } from "react";
import { AlertTriangle, Info, Pin, Siren, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { formatDatum } from "@/lib/format";
import type { Announcement, Importance } from "@/lib/infos";
import { infoAlsGelesenMarkieren } from "@/app/(app)/infos/actions";

const ICONS: Record<Importance, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: Siren,
};

const STYLES: Record<
  Importance,
  { border: string; bg: string; pillBg: string; pillText: string; label: string }
> = {
  info: {
    border: "border-border",
    bg: "bg-card",
    pillBg: "bg-muted",
    pillText: "text-muted-foreground",
    label: "Info",
  },
  warning: {
    border: "border-[hsl(var(--warning)/0.5)]",
    bg: "bg-[hsl(var(--warning)/0.05)]",
    pillBg: "bg-[hsl(var(--warning)/0.18)]",
    pillText: "text-[hsl(var(--warning))]",
    label: "Wichtig",
  },
  critical: {
    border: "border-[hsl(var(--destructive)/0.6)]",
    bg: "bg-[hsl(var(--destructive)/0.05)]",
    pillBg: "bg-[hsl(var(--destructive)/0.15)]",
    pillText: "text-[hsl(var(--destructive))]",
    label: "Dringend",
  },
};

export function InfoCard({
  info,
  istGelesen,
}: {
  info: Announcement;
  istGelesen: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const s = STYLES[info.importance];
  const Icon = ICONS[info.importance];

  function gelesen() {
    startTransition(async () => {
      await infoAlsGelesenMarkieren(info.id);
    });
  }

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-6",
        s.border,
        s.bg,
        !istGelesen && "ring-2 ring-[hsl(var(--primary)/0.15)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            s.pillBg,
            s.pillText,
          )}
        >
          <Icon className="h-3 w-3" />
          {s.label}
        </span>
        {info.pinned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary)/0.12)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
            <Pin className="h-3 w-3" />
            Angeheftet
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {formatDatum(info.created_at)}
          {info.author_name && <> · {info.author_name}</>}
        </span>
      </div>

      <h3 className="mt-4 text-balance text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
        {info.title}
      </h3>

      {info.body && (
        <div className="prose-vitness mt-3 max-w-none text-sm leading-relaxed sm:text-base">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{info.body}</ReactMarkdown>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        {istGelesen ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--success)/0.12)] px-3 py-1 text-xs font-semibold text-[hsl(var(--success))]">
            <Check className="h-3.5 w-3.5" />
            Gelesen
          </span>
        ) : (
          <button
            type="button"
            onClick={gelesen}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
          >
            <Check className="h-3.5 w-3.5" />
            Als gelesen markieren
          </button>
        )}
      </div>
    </article>
  );
}
