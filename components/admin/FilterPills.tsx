import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Einheitliche Filter-Pills (z.B. "Aktive / Archivierte zeigen",
 * "Alle / Insert / Update / Delete" im Audit-Log etc).
 *
 * Aktive Pille = Magenta gefuellt, inaktive = Border-Pille.
 * Klein, ruhig, modern -- nicht die alten chunkigen Pills.
 */
export function FilterPills({
  items,
  size = "md",
}: {
  items: { href: string; label: string; aktiv: boolean; count?: number }[];
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-xs";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full font-medium transition-colors",
            padding,
            item.aktiv
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "border border-border text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={cn(
                "ml-1.5 tabular-nums",
                item.aktiv
                  ? "text-[hsl(var(--primary-foreground)/0.7)]"
                  : "text-muted-foreground/60",
              )}
            >
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
