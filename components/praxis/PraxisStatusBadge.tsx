import { CheckCircle2, Clock3, HelpCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PraxisStatus } from "@/lib/praxis";

export function PraxisStatusBadge({ status }: { status: PraxisStatus }) {
  switch (status) {
    case "freigegeben":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Freigegeben
        </Badge>
      );
    case "abgelehnt":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Abgelehnt
        </Badge>
      );
    case "bereit":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock3 className="h-3 w-3" />
          Wartet auf Freigabe
        </Badge>
      );
    case "offen":
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <HelpCircle className="h-3 w-3" />
          Noch nicht gemeldet
        </Badge>
      );
  }
}
