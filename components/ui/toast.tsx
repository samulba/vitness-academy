"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

/**
 * Toast-Notifications via sonner. Slide-in von oben rechts, dezentes Design,
 * Magenta-Akzent fuer Success.
 *
 * Setup: einmalig in app/layout.tsx den <Toaster /> einbinden:
 *
 *   import { Toaster } from "@/components/ui/toast";
 *   ...
 *   <body>
 *     {children}
 *     <Toaster />
 *   </body>
 *
 * Dann ueberall im Code:
 *
 *   import { toast } from "@/components/ui/toast";
 *   toast.success("Standort angelegt");
 *   toast.error("Speichern fehlgeschlagen");
 *   toast.info("Magic-Link gesendet");
 *
 * Loading- und Promise-Toasts:
 *   const id = toast.loading("Lade …");
 *   toast.success("Fertig", { id });
 *
 *   toast.promise(savePromise, {
 *     loading: "Speichert …",
 *     success: "Gespeichert",
 *     error: (e) => `Fehler: ${e.message}`,
 *   });
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border bg-card text-foreground shadow-md",
          title: "text-[13px] font-medium",
          description: "text-[12px] text-muted-foreground",
          success:
            "[&_[data-icon]]:text-[hsl(var(--success))]",
          error: "[&_[data-icon]]:text-destructive",
          info: "[&_[data-icon]]:text-[hsl(var(--brand-pink))]",
        },
      }}
    />
  );
}

export const toast = sonnerToast;
