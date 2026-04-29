/**
 * Einheitlicher Admin-Header: Eyebrow + Titel + Description + Aktionen.
 * Alle Admin-Pages benutzen das, damit Hierarchie und Spacing konsistent
 * sind. Default-Eyebrow ist "Verwaltung".
 */
export function AdminPageHeader({
  eyebrow = "Verwaltung",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
