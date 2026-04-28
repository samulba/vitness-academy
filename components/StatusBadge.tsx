import { Badge } from "@/components/ui/badge";

type Status = "nicht_gestartet" | "in_bearbeitung" | "abgeschlossen" | null | undefined;

export function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case "abgeschlossen":
      return <Badge variant="success">Abgeschlossen</Badge>;
    case "in_bearbeitung":
      return <Badge variant="accent">In Bearbeitung</Badge>;
    case "nicht_gestartet":
    case null:
    case undefined:
    default:
      return <Badge variant="outline">Noch nicht gestartet</Badge>;
  }
}
