"use client";

import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { MangelStatusBadge } from "@/components/maengel/StatusBadge";
import { fotoUrlFuerPfad, type Mangel } from "@/lib/maengel-types";

const SEVERITY_DOT: Record<string, string> = {
  niedrig: "bg-zinc-400",
  normal: "bg-blue-500",
  kritisch: "bg-red-500",
};

const SEVERITY_LABEL: Record<string, string> = {
  niedrig: "Niedrig",
  normal: "Normal",
  kritisch: "Kritisch",
};

function relativeZeit(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const std = Math.floor(min / 60);
  if (std < 24) return `vor ${std} Std`;
  const tage = Math.floor(std / 24);
  if (tage < 7) return `vor ${tage} Tg`;
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function MangelCard({
  mangel,
  istEigener,
}: {
  mangel: Mangel;
  istEigener: boolean;
}) {
  const url = fotoUrlFuerPfad(mangel.photo_path);
  const istKritisch = mangel.severity === "kritisch";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-sm",
        istKritisch ? "border-red-200 bg-red-50/30" : "border-border",
      )}
    >
      {istKritisch && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-red-500"
        />
      )}

      <div className="px-6 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <ColoredAvatar
              name={mangel.reported_by_name}
              avatarPath={mangel.reported_by_avatar_path}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-sm font-semibold text-foreground">
                  {mangel.reported_by_name ?? "Anonym"}
                </span>
                {istEigener && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                    · Du
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  · {relativeZeit(mangel.created_at)}
                </span>
              </div>
            </div>
          </div>
          <MangelStatusBadge status={mangel.status} />
        </div>

        {/* Severity-Pill */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              mangel.severity === "kritisch"
                ? "bg-red-100 text-red-700"
                : mangel.severity === "normal"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-zinc-100 text-zinc-700",
            )}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[mangel.severity]}`}
            />
            {SEVERITY_LABEL[mangel.severity]}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight text-foreground">
          {mangel.title}
        </h3>

        {/* Body */}
        {mangel.description && (
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {mangel.description}
          </p>
        )}

        {/* Foto */}
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            loading="lazy"
            className="mt-4 max-h-80 w-full rounded-xl border border-border bg-muted object-cover"
          />
        ) : null}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {url ? (
            <span className="inline-flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              Foto angehängt
            </span>
          ) : (
            <span className="text-[11px]">Kein Foto</span>
          )}
        </div>
        {mangel.resolved_at && (
          <span className="text-[11px] text-muted-foreground">
            Behoben am {new Date(mangel.resolved_at).toLocaleDateString("de-DE")}
          </span>
        )}
      </div>
    </article>
  );
}
