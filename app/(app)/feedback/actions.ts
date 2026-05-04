"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  istValideKategorie,
  istValidesSentiment,
} from "@/lib/feedback";

export type FeedbackErgebnis = { ok: true } | { ok: false; message: string };

export async function feedbackErfassen(
  formData: FormData,
): Promise<FeedbackErgebnis> {
  const profile = await requireProfile();

  const memberName =
    String(formData.get("member_name") ?? "").trim() || null;
  const feedbackText = String(formData.get("feedback_text") ?? "").trim();
  const sentimentRaw = String(formData.get("sentiment") ?? "neutral");
  const categoryRaw = String(formData.get("category") ?? "allgemein");
  const locationRaw = String(formData.get("location_id") ?? "").trim();

  if (feedbackText.length < 3) {
    return { ok: false, message: "Bitte gib einen Feedback-Text ein." };
  }
  if (feedbackText.length > 4000) {
    return { ok: false, message: "Text ist zu lang (max 4000 Zeichen)." };
  }
  if (!istValidesSentiment(sentimentRaw)) {
    return { ok: false, message: "Ungültiges Sentiment." };
  }
  if (!istValideKategorie(categoryRaw)) {
    return { ok: false, message: "Ungültige Kategorie." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("member_feedback").insert({
    member_name: memberName,
    feedback_text: feedbackText,
    sentiment: sentimentRaw,
    category: categoryRaw,
    location_id: locationRaw.length > 0 ? locationRaw : null,
    captured_by: profile.id,
  });
  if (error) {
    return { ok: false, message: "Speichern fehlgeschlagen: " + error.message };
  }

  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");
  return { ok: true };
}

export async function feedbackLoeschen(id: string): Promise<FeedbackErgebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("member_feedback")
    .delete()
    .eq("id", id)
    .eq("captured_by", profile.id);
  if (error) {
    return { ok: false, message: "Löschen fehlgeschlagen: " + error.message };
  }
  revalidatePath("/feedback");
  revalidatePath("/admin/feedback");
  return { ok: true };
}
