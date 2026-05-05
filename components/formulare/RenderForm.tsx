"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField } from "@/lib/formulare";
import {
  submissionAnlegen,
  type Ergebnis,
} from "@/app/(app)/formulare/actions";

export function RenderForm({
  fields,
  templateSlug,
}: {
  fields: FormField[];
  templateSlug: string;
}) {
  const action = submissionAnlegen.bind(null, templateSlug);
  const [state, runAction, pending] = useActionState<
    Ergebnis | null,
    FormData
  >(async (_prev, fd) => action(fd), null);

  const errors = state && !state.ok ? state.errors ?? {} : {};
  const message = state && !state.ok ? state.message : null;

  return (
    <form action={runAction} className="space-y-5">
      {fields.map((f) => (
        <FieldRenderer key={f.name} field={f} error={errors[f.name]} />
      ))}

      {message && (
        <p className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {message}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {pending ? "Sende …" : "Absenden"}
        </Button>
      </div>
    </form>
  );
}

function FieldRenderer({
  field: f,
  error,
}: {
  field: FormField;
  error?: string;
}) {
  const required = f.required;
  const labelEl = (
    <Label htmlFor={f.name}>
      {f.label}
      {required && <span className="ml-1 text-[hsl(var(--destructive))]">*</span>}
    </Label>
  );

  let input: React.ReactNode;
  if (f.type === "textarea") {
    input = (
      <textarea
        id={f.name}
        name={f.name}
        required={required}
        placeholder={f.placeholder}
        rows={4}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  } else if (f.type === "select") {
    input = (
      <select
        id={f.name}
        name={f.name}
        required={required}
        defaultValue=""
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">— bitte wählen —</option>
        {(f.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else if (f.type === "radio") {
    input = (
      <div className="space-y-1.5">
        {(f.options ?? []).map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="radio"
              name={f.name}
              value={o}
              required={required}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  } else if (f.type === "checkbox") {
    input = (
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          id={f.name}
          name={f.name}
          className="h-4 w-4 accent-[hsl(var(--primary))]"
        />
        <span>Ja</span>
      </label>
    );
  } else if (f.type === "date") {
    input = (
      <Input
        id={f.name}
        name={f.name}
        type="date"
        required={required}
        placeholder={f.placeholder}
      />
    );
  } else if (f.type === "number") {
    input = (
      <Input
        id={f.name}
        name={f.name}
        type="number"
        required={required}
        placeholder={f.placeholder}
      />
    );
  } else if (f.type === "file") {
    const accept = f.accept ?? "application/pdf,image/jpeg,image/png,image/webp";
    const maxMb = f.max_size_mb ?? 5;
    input = (
      <div className="space-y-1">
        <input
          id={f.name}
          name={f.name}
          type="file"
          required={required}
          accept={accept}
          className="block w-full cursor-pointer rounded-md border border-input bg-background text-sm shadow-sm file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:border-r file:border-input file:bg-muted/40 file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
        />
        <p className="text-[11px] text-muted-foreground">
          Max. {maxMb} MB · Erlaubt: {accept.replace(/application\//g, "")}
        </p>
      </div>
    );
  } else {
    input = (
      <Input
        id={f.name}
        name={f.name}
        type="text"
        required={required}
        placeholder={f.placeholder}
      />
    );
  }

  return (
    <div className="space-y-2">
      {labelEl}
      {input}
      {f.help && (
        <p className="text-xs text-muted-foreground">{f.help}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}
