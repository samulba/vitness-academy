import { cn } from "@/lib/utils";

/**
 * Schlanke Karten-Komponente fuer Admin-Sections. Im Gegensatz zur
 * shadcn-Card hat sie kein Innenleben mit Header/Content -- man legt
 * direkt rein. Border subtiler, Radius kleiner als Studio-Cards.
 */
export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Kopfzeile fuer eine Admin-Card (Titel + Description + optionale Aktion). */
export function AdminCardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4",
        className,
      )}
    >
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

/** Innenraum fuer eine Admin-Card (Standard-Padding). */
export function AdminCardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
