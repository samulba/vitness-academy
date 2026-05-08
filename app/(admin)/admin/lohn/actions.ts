"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import { appUrl, sendEmail } from "@/lib/email";
import { lohnabrechnungMail } from "@/lib/email-templates/lohnabrechnung";
import { monatLabel } from "@/lib/lohn-types";

const PDF_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export type Ergebnis =
  | { ok: true; id?: string }
  | { ok: false; message: string };

/**
 * Admin laedt eine Lohnabrechnung fuer einen Mitarbeiter hoch.
 * FormData: user_id, monat (YYYY-MM), pdf (File), brutto_euro?, netto_euro?
 *
 * - Storage-Pfad: ${user_id}/${monat}.pdf (überschreibt vorhandene
 *   PDF mit upsert: true bei UPDATE der DB-Row)
 * - Wenn Eintrag fuer (user_id, monat) bereits existiert: UPDATE
 *   statt INSERT, alte PDF wird ueberschrieben.
 * - Bei erfolgreichem Insert (nicht Update): Mail an Mitarbeiter.
 */
export async function lohnabrechnungHochladen(
  formData: FormData,
): Promise<Ergebnis> {
  const admin = await requireRole(["admin", "superadmin"]);

  const userId = String(formData.get("user_id") ?? "").trim();
  const monat = String(formData.get("monat") ?? "").trim();
  const pdf = formData.get("pdf");
  const bruttoStr = String(formData.get("brutto_euro") ?? "").trim();
  const nettoStr = String(formData.get("netto_euro") ?? "").trim();

  if (!userId) return { ok: false, message: "Mitarbeiter fehlt." };
  if (!/^\d{4}-\d{2}$/.test(monat)) {
    return { ok: false, message: "Monat-Format YYYY-MM erforderlich." };
  }
  if (!(pdf instanceof File) || pdf.size === 0) {
    return { ok: false, message: "Bitte eine PDF-Datei hochladen." };
  }
  if (pdf.type !== "application/pdf") {
    return { ok: false, message: "Nur PDF-Dateien erlaubt." };
  }
  if (pdf.size > PDF_MAX_BYTES) {
    return { ok: false, message: "PDF zu groß (max 10 MB)." };
  }

  const brutto = bruttoStr ? Number(bruttoStr.replace(",", ".")) : null;
  const netto = nettoStr ? Number(nettoStr.replace(",", ".")) : null;
  if (brutto !== null && Number.isNaN(brutto)) {
    return { ok: false, message: "Brutto-Betrag ungültig." };
  }
  if (netto !== null && Number.isNaN(netto)) {
    return { ok: false, message: "Netto-Betrag ungültig." };
  }
  const bruttoCents = brutto !== null ? Math.round(brutto * 100) : null;
  const nettoCents = netto !== null ? Math.round(netto * 100) : null;

  const path = `${userId}/${monat}.pdf`;
  const buffer = Buffer.from(await pdf.arrayBuffer());

  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from("lohnabrechnungen")
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadError) {
    return {
      ok: false,
      message: "Upload fehlgeschlagen: " + uploadError.message,
    };
  }

  const { data: existing } = await supabase
    .from("lohnabrechnungen")
    .select("id")
    .eq("user_id", userId)
    .eq("monat", monat)
    .maybeSingle();

  const istUpdate = !!existing;

  if (existing) {
    const { error } = await supabase
      .from("lohnabrechnungen")
      .update({
        pdf_path: path,
        brutto_cents: bruttoCents,
        netto_cents: nettoCents,
        hochgeladen_von: admin.id,
        hochgeladen_am: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      return {
        ok: false,
        message: "DB-Update fehlgeschlagen: " + error.message,
      };
    }
  } else {
    const { error } = await supabase.from("lohnabrechnungen").insert({
      user_id: userId,
      monat,
      pdf_path: path,
      brutto_cents: bruttoCents,
      netto_cents: nettoCents,
      hochgeladen_von: admin.id,
    });
    if (error) {
      return {
        ok: false,
        message: "DB-Insert fehlgeschlagen: " + error.message,
      };
    }
  }

  // Mitarbeiter per Mail informieren — nur bei erstem Upload, nicht
  // bei stillem Re-Upload (sonst Spam wenn Admin korrigiert).
  if (!istUpdate) {
    try {
      const adminClient = createAdminClient();
      const [{ data: profil }, { data: authUser }] = await Promise.all([
        adminClient
          .from("profiles")
          .select("first_name, full_name")
          .eq("id", userId)
          .maybeSingle(),
        adminClient.auth.admin.getUserById(userId),
      ]);
      const empfaenger = authUser?.user?.email;
      if (empfaenger) {
        const vorname =
          profil?.first_name ?? profil?.full_name ?? "im Team";
        const { subject, html, text } = lohnabrechnungMail({
          vorname,
          monatLabel: monatLabel(monat),
          monatYYYYMM: monat,
          bruttoCents,
          nettoCents,
          appUrl: appUrl(),
        });
        const r = await sendEmail({ to: empfaenger, subject, html, text });
        if (!r.ok) {
          console.warn(
            "[lohnabrechnungHochladen] Mail nicht versendet:",
            r.message,
          );
        }
      }
    } catch (e) {
      console.warn("[lohnabrechnungHochladen] Mail crashte (ignoriert):", e);
    }
  }

  revalidatePath("/admin/lohn");
  revalidatePath(`/admin/lohn/${userId}`);
  revalidatePath("/lohn");
  return { ok: true };
}

export async function lohnabrechnungLoeschen(id: string): Promise<Ergebnis> {
  await requireRole(["admin", "superadmin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("lohnabrechnungen")
    .select("user_id, pdf_path")
    .eq("id", id)
    .maybeSingle();

  if (data?.pdf_path) {
    await supabase.storage.from("lohnabrechnungen").remove([data.pdf_path]);
  }
  const { error } = await supabase
    .from("lohnabrechnungen")
    .delete()
    .eq("id", id);
  if (error) {
    return { ok: false, message: "Löschen fehlgeschlagen: " + error.message };
  }

  revalidatePath("/admin/lohn");
  if (data?.user_id) {
    revalidatePath(`/admin/lohn/${data.user_id}`);
    revalidatePath("/lohn");
  }
  return { ok: true };
}
