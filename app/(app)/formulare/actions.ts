"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import {
  ladeTemplateBySlug,
  validiereSubmission,
  type FileWert,
} from "@/lib/formulare";

export type Ergebnis =
  | { ok: true; id: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

const FILE_ERLAUBT_DEFAULT = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

function pruefeMime(mime: string, accept: string | undefined): boolean {
  const liste = (accept ?? FILE_ERLAUBT_DEFAULT.join(","))
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (liste.length === 0) return true;
  return liste.some((rule) => {
    if (rule.endsWith("/*")) {
      return mime.startsWith(rule.slice(0, rule.length - 1));
    }
    return mime === rule;
  });
}

function dateiendung(mime: string, fallbackName: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  const m = fallbackName.match(/\.([a-z0-9]{1,8})$/i);
  return m ? m[1].toLowerCase() : "bin";
}

export async function submissionAnlegen(
  templateSlug: string,
  formData: FormData,
): Promise<Ergebnis> {
  const profile = await requireProfile();
  const tpl = await ladeTemplateBySlug(templateSlug);
  if (!tpl || tpl.status !== "aktiv") {
    return { ok: false, message: "Formular nicht gefunden oder nicht aktiv." };
  }

  const v = validiereSubmission(tpl.fields, formData);
  if (!v.ok) return { ok: false, errors: v.errors };

  const supabase = await createClient();

  // File-Felder: hochladen + Pfade in data einbauen.
  const fileFelder = tpl.fields.filter((f) => f.type === "file");
  if (fileFelder.length > 0) {
    const errors: Record<string, string> = {};
    for (const f of fileFelder) {
      const raw = formData.get(f.name);
      if (!(raw instanceof File) || raw.size === 0) {
        // Nicht-required File-Felder duerfen leer bleiben.
        v.data[f.name] = null;
        continue;
      }
      const maxBytes = (f.max_size_mb ?? 5) * 1024 * 1024;
      if (raw.size > maxBytes) {
        errors[f.name] = `Datei ist zu groß (max ${f.max_size_mb ?? 5} MB).`;
        continue;
      }
      if (!pruefeMime(raw.type, f.accept)) {
        errors[f.name] = `Dateityp ${raw.type || "unbekannt"} nicht erlaubt.`;
        continue;
      }
      const ext = dateiendung(raw.type, raw.name);
      const path = `${profile.id}/${Date.now()}-${f.name}.${ext}`;
      const buffer = Buffer.from(await raw.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("form-attachments")
        .upload(path, buffer, {
          contentType: raw.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) {
        errors[f.name] = "Upload fehlgeschlagen: " + uploadError.message;
        continue;
      }
      const wert: FileWert = {
        path,
        name: raw.name,
        size: raw.size,
        type: raw.type,
      };
      v.data[f.name] = wert;
    }
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }
  }

  const { data, error } = await supabase
    .from("form_submissions")
    .insert({
      template_id: tpl.id,
      submitted_by: profile.id,
      data: v.data,
      status: "eingereicht",
    })
    .select("id")
    .single();
  if (error) {
    return {
      ok: false,
      message: "Speichern fehlgeschlagen: " + error.message,
    };
  }

  revalidatePath("/formulare");
  revalidatePath("/admin/formulare/eingaenge");
  redirect(`/formulare/eingereicht/${data.id}`);
}
