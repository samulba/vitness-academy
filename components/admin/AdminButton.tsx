import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Schlanker, moderner Admin-CTA. Zwei Varianten: primary (magenta gefuellt,
 * sparsam einsetzen) und secondary (border-only, fuer alles was nicht der
 * Haupt-Action ist). Bewusst kleiner und eckiger als die alten chunky
 * Buttons -- nähert sich Linear/Vercel-Look.
 */
type Variant = "primary" | "secondary";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]",
  secondary:
    "border border-border bg-background text-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
};

const BASE =
  "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none";

export function AdminButton({
  variant = "primary",
  href,
  type = "button",
  onClick,
  disabled,
  className,
  children,
}: {
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const cls = cn(BASE, VARIANT[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
    >
      {children}
    </button>
  );
}
