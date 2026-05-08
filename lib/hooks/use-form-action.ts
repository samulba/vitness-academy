"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type Ergebnis<T = unknown> =
  | { ok: true; data?: T; id?: string }
  | { ok: false; message: string };

export type FormActionOptions<T> = {
  /** Toast-Text bei Erfolg. Default: "Gespeichert". */
  successToast?: string | ((data: T | undefined) => string);
  /** Toast-Text bei Fehler. Default: result.message. */
  errorToast?: string;
  /** Nach Success router.push(href) — fuer echte View-Wechsel. */
  pushTo?: string | ((data: T | undefined) => string);
  /** Form nach Success zuruecksetzen. */
  resetForm?: boolean;
  /** Zusaetzlicher Callback nach Success (vor push/refresh). */
  onSuccess?: (data: T | undefined) => void;
};

/**
 * Robuster Form-Action-Wrapper. Loest die useActionState-Pending-
 * Stuck-Probleme: useTransition setzt pending zuverlaessig nach jedem
 * Submit zurueck, egal ob Success oder Error.
 *
 * Verwendung:
 *   const { run, pending, formRef } = useFormAction(myAction, {
 *     successToast: "Erfolgreich gespeichert",
 *     pushTo: "/some/path",   // optional - sonst router.refresh()
 *     resetForm: true,
 *   });
 *   <form ref={formRef} action={run}>...</form>
 */
export function useFormAction<T = unknown>(
  action: (formData: FormData) => Promise<Ergebnis<T>>,
  options: FormActionOptions<T> = {},
) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<Ergebnis<T> | null>(null);

  function run(formData: FormData) {
    startTransition(async () => {
      let result: Ergebnis<T>;
      try {
        result = await action(formData);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
        // Next.js Control-Flow nicht schlucken
        if (/NEXT_REDIRECT|NEXT_NOT_FOUND/.test(msg)) throw e;
        result = { ok: false, message: msg };
      }
      setState(result);

      if (result.ok) {
        const successText =
          typeof options.successToast === "function"
            ? options.successToast(result.data)
            : (options.successToast ?? "Gespeichert");
        toast.success(successText);

        if (options.resetForm) {
          formRef.current?.reset();
        }

        options.onSuccess?.(result.data);

        if (options.pushTo) {
          const href =
            typeof options.pushTo === "function"
              ? options.pushTo(result.data)
              : options.pushTo;
          router.push(href);
        } else {
          router.refresh();
        }
      } else {
        toast.error(options.errorToast ?? result.message);
      }
    });
  }

  return { run, pending, state, formRef };
}
