"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  CalendarClock,
  Check,
  Eye,
  Megaphone,
  MoreHorizontal,
  Pin,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import {
  type Announcement,
  type Importance,
  type InfoKategorie,
  kategorieLabel,
} from "@/lib/infos-types";
import { useRelativeZeit } from "@/lib/hooks/useRelativeZeit";
import {
  eigeneInfoLoeschen,
  infoAlsGelesenMarkieren,
} from "@/app/(app)/infos/actions";

const KATEGORIE_ICONS: Record<InfoKategorie, typeof Megaphone> = {
  allgemein: Megaphone,
  geraete: Wrench,
  schicht: CalendarClock,
  mitglieder: Users,
  sonstiges: MoreHorizontal,
};

const IMPORTANCE_DOT: Record<Importance, string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
};

const IMPORTANCE_LABEL: Record<Importance, string> = {
  info: "Info",
  warning: "Wichtig",
  critical: "Dringend",
};

export function InfoCard({
  info,
  istGelesen,
  istEigene = false,
  standortName,
  authorAvatarPath,
  readCount,
}: {
  info: Announcement;
  istGelesen: boolean;
  istEigene?: boolean;
  standortName?: string | null;
  authorAvatarPath?: string | null;
  readCount?: number;
}) {
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loeschError, setLoeschError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const zeit = useRelativeZeit(info.created_at);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const KatIcon = KATEGORIE_ICONS[info.category];
  const istDringend = info.importance === "critical";

  function gelesen() {
    startTransition(async () => {
      await infoAlsGelesenMarkieren(info.id);
    });
  }

  function loeschen() {
    setMenuOpen(false);
    if (!confirm("Diese Info wirklich löschen?")) return;
    setLoeschError(null);
    startTransition(async () => {
      const res = await eigeneInfoLoeschen(info.id);
      if (!res.ok) setLoeschError(res.message);
    });
  }

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-sm",
        istDringend
          ? "border-red-200 bg-red-50/30"
          : "border-border",
      )}
    >
      {istDringend && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-red-500"
        />
      )}

      <div className="px-6 pt-5">
        {/* Header: Avatar + Name + Time + Optionsmenu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <ColoredAvatar
              name={info.author_name}
              avatarPath={authorAvatarPath ?? null}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-sm font-semibold text-foreground">
                  {info.author_name ?? "Studio"}
                </span>
                {istEigene && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                    · Du
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {zeit ? `· ${zeit}` : ""}
                </span>
              </div>
            </div>
          </div>

          {istEigene && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Optionen"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={loeschen}
                    disabled={pending}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Info löschen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pills-Reihe */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <KatIcon className="h-3 w-3" />
            {kategorieLabel(info.category)}
          </span>
          {standortName && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {standortName}
            </span>
          )}
          {info.importance !== "info" && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                info.importance === "warning"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700",
              )}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${IMPORTANCE_DOT[info.importance]}`}
              />
              {IMPORTANCE_LABEL[info.importance]}
            </span>
          )}
          {info.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(var(--primary))]">
              <Pin className="h-2.5 w-2.5" />
              Angeheftet
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight text-foreground">
          {info.title}
        </h3>

        {/* Body */}
        {info.body && (
          <div className="prose-vitness mt-1 max-w-none text-sm leading-relaxed text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{info.body}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3">
        <div className="flex items-center gap-2">
          {istGelesen ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--success))]">
              <Check className="h-3.5 w-3.5" />
              Gelesen
            </span>
          ) : (
            <button
              type="button"
              onClick={gelesen}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-60"
            >
              <Check className="h-3 w-3" />
              Als gelesen markieren
            </button>
          )}
        </div>
        {readCount !== undefined && readCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {readCount} {readCount === 1 ? "gelesen" : "gelesen"}
          </span>
        )}
      </div>

      {loeschError && (
        <div className="px-6 pb-4">
          <p className="rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
            {loeschError}
          </p>
        </div>
      )}
    </article>
  );
}
