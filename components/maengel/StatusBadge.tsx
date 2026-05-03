import { type Status, STATUS_LABEL } from "@/lib/maengel-types";
import { cn } from "@/lib/utils";

const STYLES: Record<Status, string> = {
  offen: "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
  in_bearbeitung: "bg-[hsl(var(--warning)/0.18)] text-[hsl(var(--warning))]",
  behoben: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
  verworfen: "bg-muted text-muted-foreground",
};

export function MangelStatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        STYLES[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
