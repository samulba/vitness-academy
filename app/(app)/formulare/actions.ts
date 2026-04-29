"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import {
  ladeTemplateBySlug,
  validiereSubmission,
} from "@/lib/formulare";

export type Ergebnis =
  | { ok: true; id: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

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
