import { Download } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { istFileWert, type FileWert } from "@/lib/formulare";

function bytesLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Server-Component: rendert einen Download-Link mit signed URL
 * (1h gueltig). Wird im Admin-Submission-Detail genutzt.
 */
export async function DownloadLink({ wert }: { wert: unknown }) {
  if (!istFileWert(wert)) {
    return <span className="text-muted-foreground">—</span>;
  }
  const file = wert as FileWert;
  const admin = createAdminClient();
  const { data } = await admin.storage
    .from("form-attachments")
    .createSignedUrl(file.path, 60 * 60);

  if (!data?.signedUrl) {
    return (
      <span className="text-xs text-muted-foreground">
        {file.name} (Link nicht verfügbar)
      </span>
    );
  }

  return (
    <a
      href={data.signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)]"
    >
      <Download className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-pink))]" />
      <span className="truncate">{file.name}</span>
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {bytesLabel(file.size)}
      </span>
    </a>
  );
}
