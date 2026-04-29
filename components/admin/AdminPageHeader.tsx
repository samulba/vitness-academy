/**
 * Einheitlicher Admin-Header. Sieht moderner aus als blosser Eyebrow + h1:
 * Eyebrow hat einen Magenta-Dot davor, Title kann optional eine Live-Pille
 * neben sich haben (z.B. "12 aktive jetzt" auf dem Studio-Puls).
 */
export function AdminPageHeader({
  eyebrow = "Verwaltung",
  title,
  description,
  actions,
  badge,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Optionaler Status/Live-Indicator rechts vom Title (z.B. "Live" mit pulsierendem Dot) */
  badge?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-pink))]">
          <span
            aria-hidden
            className="inline-block h-1 w-1 rounded-full bg-[hsl(var(--brand-pink))]"
          />
          {eyebrow}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
