import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Up/Down-Reihenfolge-Buttons. Jede Schaltflaeche feuert eine eigene
 * Server-Action (bereits gebunden mit ID + Richtung).
 */
export function ReihenfolgeButtons({
  hoch,
  runter,
  hochDeaktiviert,
  runterDeaktiviert,
}: {
  hoch: () => Promise<void> | void;
  runter: () => Promise<void> | void;
  hochDeaktiviert?: boolean;
  runterDeaktiviert?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={hoch}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={hochDeaktiviert}
          className="h-7 w-7"
          aria-label="Nach oben"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </form>
      <form action={runter}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={runterDeaktiviert}
          className="h-7 w-7"
          aria-label="Nach unten"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
