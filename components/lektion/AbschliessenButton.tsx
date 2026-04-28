"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AbschliessenSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="success" size="lg" disabled={pending}>
      <CheckCircle2 className="h-4 w-4" />
      {pending ? "Speichere …" : "Lektion abschließen"}
    </Button>
  );
}

export function ZurueckSetzenSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      <RotateCcw className="h-4 w-4" />
      {pending ? "Setze zurück …" : "Erneut bearbeiten"}
    </Button>
  );
}
