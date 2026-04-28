"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockEditor } from "@/components/admin/BlockEditor";

type BlockTyp = "text" | "checkliste" | "video_url" | "hinweis";

export function BlockBearbeitenInline({
  action,
  initial,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial: {
    block_type: BlockTyp;
    content: Record<string, unknown>;
  };
}) {
  const [offen, setOffen] = useState(false);

  if (!offen) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOffen(true)}
        type="button"
      >
        <Pencil className="h-3.5 w-3.5" />
        Bearbeiten
      </Button>
    );
  }

  return (
    <div className="w-full rounded-lg border bg-background p-3">
      <BlockEditor
        modus="bearbeiten"
        initial={initial}
        action={action}
        onAbbrechen={() => setOffen(false)}
      />
    </div>
  );
}
