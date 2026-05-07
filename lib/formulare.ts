import { createClient } from "@/lib/supabase/server";

// Re-export aller client-safe Types und Konstanten aus formulare-types.
// Server-Code kann weiter aus @/lib/formulare importieren wie bisher.
export {
  istFileWert,
  istVertretungsPlan,
  STATUS_LABEL,
  type FieldType,
  type FileWert,
  type FormField,
  type Status,
  type Submission,
  type SubmissionStatus,
  type Template,
  type VertretungsTag,
} from "@/lib/formulare-types";

import type {
  FormField,
  Status,
  Submission,
  SubmissionStatus,
  Template,
} from "@/lib/formulare-types";

const TEMPLATE_SELECT = `
  id, location_id, slug, title, description, fields, status,
  sort_order, created_at, updated_at
`;

const SUBMISSION_SELECT = `
  id, template_id, submitted_by, data, status, admin_note,
  submitted_at, processed_by, processed_at,
  submitter:submitted_by ( full_name ),
  processor:processed_by ( full_name ),
  template:template_id ( title )
`;

function mapTemplate(r: {
  id: string;
  location_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  fields: unknown;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}): Template {
  return {
    id: r.id,
    location_id: r.location_id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    fields: Array.isArray(r.fields) ? (r.fields as FormField[]) : [],
    status: (["entwurf", "aktiv", "archiviert"].includes(r.status)
      ? r.status
      : "aktiv") as Status,
    sort_order: r.sort_order,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export async function ladeTemplates(opts?: {
  nurAktiv?: boolean;
}): Promise<Template[]> {
  const supabase = await createClient();
  let q = supabase
    .from("form_templates")
    .select(TEMPLATE_SELECT)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (opts?.nurAktiv) q = q.eq("status", "aktiv");
  const { data } = await q;
  return ((data ?? []) as Parameters<typeof mapTemplate>[0][]).map(mapTemplate);
}

export async function ladeTemplate(id: string): Promise<Template | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("form_templates")
    .select(TEMPLATE_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapTemplate(data as Parameters<typeof mapTemplate>[0]) : null;
}

export async function ladeTemplateBySlug(slug: string): Promise<Template | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("form_templates")
    .select(TEMPLATE_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapTemplate(data as Parameters<typeof mapTemplate>[0]) : null;
}

type SubmissionRoh = {
  id: string;
  template_id: string;
  submitted_by: string;
  data: unknown;
  status: string;
  admin_note: string | null;
  submitted_at: string;
  processed_by: string | null;
  processed_at: string | null;
  submitter: { full_name: string | null } | null;
  processor: { full_name: string | null } | null;
  template: { title: string | null } | null;
};

function mapSubmission(r: SubmissionRoh): Submission {
  return {
    id: r.id,
    template_id: r.template_id,
    submitted_by: r.submitted_by,
    submitted_by_name: r.submitter?.full_name ?? null,
    template_title: r.template?.title ?? null,
    data:
      typeof r.data === "object" && r.data !== null
        ? (r.data as Record<string, unknown>)
        : {},
    status: ([
      "eingereicht",
      "in_bearbeitung",
      "erledigt",
      "abgelehnt",
    ].includes(r.status)
      ? r.status
      : "eingereicht") as SubmissionStatus,
    admin_note: r.admin_note,
    submitted_at: r.submitted_at,
    processed_by: r.processed_by,
    processed_by_name: r.processor?.full_name ?? null,
    processed_at: r.processed_at,
  };
}

export async function ladeSubmissions(opts?: {
  status?: SubmissionStatus[];
  submittedBy?: string;
}): Promise<Submission[]> {
  const supabase = await createClient();
  let q = supabase
    .from("form_submissions")
    .select(SUBMISSION_SELECT)
    .order("submitted_at", { ascending: false });
  if (opts?.status && opts.status.length > 0) {
    q = q.in("status", opts.status);
  }
  if (opts?.submittedBy) q = q.eq("submitted_by", opts.submittedBy);
  const { data } = await q;
  return ((data ?? []) as unknown as SubmissionRoh[]).map(mapSubmission);
}

export async function ladeSubmission(id: string): Promise<Submission | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("form_submissions")
    .select(SUBMISSION_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapSubmission(data as unknown as SubmissionRoh) : null;
}

/**
 * Validiert ein FormData-Objekt gegen ein Template.
 * Liefert errors-Map oder einen sauberen data-Wert.
 */
export function validiereSubmission(
  fields: FormField[],
  formData: FormData,
):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const data: Record<string, unknown> = {};

  for (const f of fields) {
    if (f.type === "checkbox") {
      data[f.name] = formData.get(f.name) === "on";
      continue;
    }
    if (f.type === "file") {
      // Datei-Upload wird separat in der Server-Action verarbeitet,
      // hier nur Required-Check.
      const raw = formData.get(f.name);
      const istLeer =
        !raw ||
        (typeof raw === "string" && raw.trim().length === 0) ||
        (raw instanceof File && raw.size === 0);
      if (f.required && istLeer) {
        errors[f.name] = `${f.label} ist Pflicht.`;
      }
      continue;
    }
    if (f.type === "vertretungs_plan") {
      // Renderer schickt entweder
      //   - einen "pauschal"-Mode: ${name}__pauschal als Single-String, oder
      //   - eine Reihe pro Tag: ${name}__YYYY-MM-DD je leeres oder befuelltes Input.
      // Beides resultiert in einem strukturierten Array — pauschal als
      // ein einziger Eintrag mit tag = "" (Sentinel), Tagesreihen als
      // sortierte Liste.
      const pauschal = formData.get(`${f.name}__pauschal`);
      if (typeof pauschal === "string" && pauschal.trim().length > 0) {
        data[f.name] = [{ tag: "", person: pauschal.trim() }];
        continue;
      }
      const prefix = `${f.name}__`;
      const tagRegex = /^\d{4}-\d{2}-\d{2}$/;
      const eintraege: { tag: string; person: string }[] = [];
      for (const [key, value] of formData.entries()) {
        if (!key.startsWith(prefix)) continue;
        const tag = key.slice(prefix.length);
        if (!tagRegex.test(tag)) continue; // ignoriert __pauschal etc.
        const person =
          typeof value === "string" ? value.trim() : "";
        eintraege.push({ tag, person });
      }
      eintraege.sort((a, b) => a.tag.localeCompare(b.tag));
      if (f.required && eintraege.every((e) => e.person.length === 0)) {
        errors[f.name] = `${f.label} muss mindestens eine Vertretung enthalten.`;
        continue;
      }
      data[f.name] = eintraege;
      continue;
    }
    const raw = formData.get(f.name);
    const wert = typeof raw === "string" ? raw.trim() : "";
    if (f.required && wert.length === 0) {
      errors[f.name] = `${f.label} ist Pflicht.`;
      continue;
    }
    if (wert.length === 0) {
      data[f.name] = null;
      continue;
    }
    if (f.type === "number") {
      const n = Number(wert);
      if (Number.isNaN(n)) {
        errors[f.name] = `${f.label} muss eine Zahl sein.`;
      } else {
        data[f.name] = n;
      }
      continue;
    }
    data[f.name] = wert;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}
