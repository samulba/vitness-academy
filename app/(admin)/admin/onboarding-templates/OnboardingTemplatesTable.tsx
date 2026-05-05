"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { rolleLabel } from "@/lib/format";
import type { TemplateMitMeta } from "@/lib/onboarding-templates";

export function OnboardingTemplatesTable({
  templates,
}: {
  templates: TemplateMitMeta[];
}) {
  const columns: Column<TemplateMitMeta>[] = [
    {
      key: "name",
      label: "Template",
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{t.name}</span>
            {t.beschreibung && (
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                {t.beschreibung}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rolle",
      sortable: true,
      render: (t) => (
        <span className="text-xs text-muted-foreground">
          {rolleLabel(t.role)}
        </span>
      ),
    },
    {
      key: "lernpfad_count",
      label: "Lernpfade",
      sortable: true,
      align: "right",
      render: (t) => (
        <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
          <GraduationCap className="h-3 w-3" />
          {t.lernpfad_count}
        </span>
      ),
    },
  ];

  return (
    <DataTable<TemplateMitMeta>
      data={templates}
      columns={columns}
      searchable={{ placeholder: "Template suchen…", keys: ["name"] }}
      rowHref={(t) => `/admin/onboarding-templates/${t.id}`}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}
