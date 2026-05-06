"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/admin/SortableList";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { ContentBlockView } from "@/components/lektion/ContentBlock";
import {
  blockAktualisieren,
  blockAnlegen,
  blockLoeschen,
  blockReihenfolgeBulk,
} from "./actions";

type BlockTyp =
  | "text"
  | "checkliste"
  | "video_url"
  | "hinweis"
  | "aufdeck_karte"
  | "inline_quiz"
  | "akkordeon"
  | "sortieren"
  | "szenario"
  | "schritte";

const TYP_LABEL: Record<BlockTyp, string> = {
  text: "Text",
  checkliste: "Checkliste",
  video_url: "Video",
  hinweis: "Hinweis",
  aufdeck_karte: "Aufdeck-Karte",
  inline_quiz: "Inline-Quiz",
  akkordeon: "Akkordeon",
  sortieren: "Sortier-Aufgabe",
  szenario: "Szenario",
  schritte: "Schritte",
};

export type Block = {
  id: string;
  block_type: BlockTyp;
  content: Record<string, unknown>;
  sort_order: number;
};

export function BloeckeListe({
  lektionId,
  blocks,
}: {
  lektionId: string;
  blocks: Block[];
}) {
  const [neuOffen, setNeuOffen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const router = useRouter();

  async function onReorder(neueIds: string[]) {
    setSyncing(true);
    setSyncError(null);
    const res = await blockReihenfolgeBulk(lektionId, neueIds);
    setSyncing(false);
    if (!res.ok) {
      setSyncError(res.message ?? "Speichern fehlgeschlagen");
      router.refresh();
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            Inhalts-Blöcke
            {syncing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
                Speichert…
              </span>
            )}
            {syncError && (
              <span className="rounded-full bg-[hsl(var(--destructive)/0.12)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--destructive))]">
                {syncError}
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Reihenfolge per Drag-Handle, klick auf Bearbeiten für Inline-Edit.
            Markdown · Checklisten · Hinweise · interaktive Bausteine.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setNeuOffen(true)}
          className="gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Plus className="h-4 w-4" />
          Neuer Block
        </Button>
      </header>

      {neuOffen && (
        <NeuerBlockForm
          lektionId={lektionId}
          onClose={() => setNeuOffen(false)}
        />
      )}

      {blocks.length === 0 ? (
        !neuOffen && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Noch keine Blöcke. Klick auf <span className="font-medium">&bdquo;Neuer Block&ldquo;</span> um zu starten.
          </div>
        )
      ) : (
        <SortableList
          items={blocks}
          onReorder={onReorder}
          renderItem={(b, dragHandle) => (
            <BlockZeile lektionId={lektionId} block={b} dragHandle={dragHandle} />
          )}
        />
      )}
    </section>
  );
}

function BlockZeile({
  lektionId,
  block,
  dragHandle,
}: {
  lektionId: string;
  block: Block;
  dragHandle: React.ReactNode;
}) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function speichern(formData: FormData) {
    startTransition(async () => {
      await blockAktualisieren(lektionId, block.id, formData);
      setBearbeiten(false);
      router.refresh();
    });
  }

  async function loeschen() {
    if (!confirm("Diesen Inhalts-Block wirklich löschen?")) return;
    startTransition(async () => {
      await blockLoeschen(lektionId, block.id);
      router.refresh();
    });
  }

  if (bearbeiten) {
    return (
      <div className="rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(var(--primary))]">
            {TYP_LABEL[block.block_type]} bearbeiten
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBearbeiten(false)}
            disabled={pending}
            className="h-7 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Abbrechen
          </Button>
        </div>
        <BlockEditor
          modus="bearbeiten"
          initial={{ block_type: block.block_type, content: block.content }}
          action={speichern}
          onAbbrechen={() => setBearbeiten(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-background transition-colors hover:border-[hsl(var(--primary)/0.4)]",
        pending && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {dragHandle}
        <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {TYP_LABEL[block.block_type]}
        </span>
        <div className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {previewText(block)}
        </div>
        <div className="flex items-center gap-0.5 transition-opacity [@media(hover:hover)]:opacity-60 [@media(hover:hover)]:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setBearbeiten(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Block bearbeiten"
            title="Bearbeiten"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={loeschen}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.12)] hover:text-[hsl(var(--destructive))]"
            aria-label="Block löschen"
            title="Löschen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3">
        <ContentBlockView block={block} />
      </div>
    </div>
  );
}

function NeuerBlockForm({
  lektionId,
  onClose,
}: {
  lektionId: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function anlegen(formData: FormData) {
    startTransition(async () => {
      await blockAnlegen(lektionId, formData);
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="mb-3 rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(var(--primary))]">
          Neuer Block
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={pending}
          className="h-7 gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Abbrechen
        </Button>
      </div>
      <BlockEditor modus="anlegen" action={anlegen} onAbbrechen={onClose} />
    </div>
  );
}

function previewText(b: Block): string {
  const c = b.content as Record<string, unknown>;
  const fromKeys = ["body", "frage", "aufgabe", "situation_markdown", "titel", "url"];
  for (const k of fromKeys) {
    const v = c[k];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.replace(/[#*_`]/g, "").slice(0, 120);
    }
  }
  if (Array.isArray(c.items) && c.items.length > 0) {
    const first = c.items[0];
    if (typeof first === "string") return first.slice(0, 120);
    if (first && typeof first === "object" && "frage" in first) {
      return String((first as { frage: string }).frage ?? "").slice(0, 120);
    }
  }
  return TYP_LABEL[b.block_type];
}
