import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Einheitlicher Empty-State innerhalb von AdminCards.
 * Bewusst optisch praesent: Magenta-Glow-Kreis um Icon, klare Headline,
 * unterstuetzender Text, optionale CTA. Kein "Niente"-Vakuum mehr.
 */
export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span
        aria-hidden
        className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]"
      >
        <span
          aria-hidden
          className="absolute -inset-2 -z-10 rounded-3xl bg-[hsl(var(--brand-pink)/0.08)] blur-xl"
        />
        {icon}
      </span>
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-md bg-[hsl(var(--primary))] px-3 text-[13px] font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
