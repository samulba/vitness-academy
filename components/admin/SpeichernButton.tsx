"use client";

import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpeichernButton({
  label = "Speichern",
  variant = "default",
}: {
  label?: string;
  variant?: "default" | "success";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={variant}>
      <Save className="h-4 w-4" />
      {pending ? "Speichere …" : label}
    </Button>
  );
}
