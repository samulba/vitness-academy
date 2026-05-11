"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requirePermission } from "@/lib/auth";
import type {
  BugKategorie,
  BugPrioritaet,
  BugStatus,
} from "@/lib/bug-reports-types";

const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;
const SCREENSHOT_ERLAUBT = ["image/jpeg", "image/png", "image/webp"];

type MeldenErgebnis =
  | { ok: true; status: "neu"; id: string }
  | { ok: true; status: "bekannt"; bug_status: BugStatus; meldungen_count: number }
  | { ok: false; message: string };

/**
 * Meldung aus dem Error-Popup. Dedup über error_digest:
 * Existiert ein offener Report mit gleichem Digest -> meldungen_count++
 * und Antwort "bekannt", sonst neuer Eintrag.
 */
export async function bugAusPopupMelden(input: {
  digest: string | null;
  pfad: string | null;
  userAgent: string | null;
  message: string | null;
  stack: string | null;
  beschreibung: string | null;
}): Promise<MeldenErgebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const beschreibung = (input.beschreibung ?? "").trim();
  const digest = input.digest?.trim() || null;

  // Dedup-Check nur wenn Digest vorhanden
  if (digest) {
    const { data: bestehend } = await supabase
      .from("bug_reports")
      .select("id, status, meldungen_count")
      .eq("error_digest", digest)
      .in("status", ["neu", "in_bearbeitung"])
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (bestehend) {
      const neuerCount = (bestehend.meldungen_count ?? 1) + 1;
      const notizAnhang = beschreibung
        ? `\n--- Weitere Meldung von ${profile.full_name ?? profile.id} ---\n${beschreibung}`
        : null;

      const update: Record<string, unknown> = {
        meldungen_count: neuerCount,
        letzte_meldung_at: new Date().toISOString(),
      };
      if (notizAnhang) {
        const { data: aktuelle } = await supabase
          .from("bug_reports")
          .select("admin_notiz")
          .eq("id", bestehend.id)
          .maybeSingle();
        update.admin_notiz =
          (aktuelle?.admin_notiz ?? "") + notizAnhang;
      }

      await supabase
        .from("bug_reports")
        .update(update)
        .eq("id", bestehend.id);

      revalidatePath("/admin/bug-reports");
      return {
        ok: true,
        status: "bekannt",
        bug_status: bestehend.status as BugStatus,
        meldungen_count: neuerCount,
      };
    }
  }

  const { data, error } = await supabase
    .from("bug_reports")
    .insert({
      error_digest: digest,
      pfad: input.pfad,
      user_agent: input.userAgent,
      fehler_message: input.message,
      fehler_stack: input.stack,
      beschreibung: beschreibung.length > 0 ? beschreibung : null,
      kategorie: "bug",
      quelle: "error_popup",
      status: "neu",
      prioritaet: "normal",
      reported_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: "Speichern fehlgeschlagen: " + (error?.message ?? "unbekannt"),
    };
  }

  revalidatePath("/admin/bug-reports");
  return { ok: true, status: "neu", id: data.id };
}

/**
 * Manuelle Meldung von /problem-melden. Kein Dedup (User-Text frei).
 */
export async function bugManuellMelden(formData: FormData): Promise<
  { ok: true; id: string } | { ok: false; message: string }
> {
  const profile = await requireProfile();

  const beschreibung = String(formData.get("beschreibung") ?? "").trim();
  const kategorie = String(formData.get("kategorie") ?? "bug") as BugKategorie;
  const prioritaet = String(formData.get("prioritaet") ?? "normal") as BugPrioritaet;
  const pfad = String(formData.get("pfad") ?? "").trim();
  const userAgent = String(formData.get("user_agent") ?? "").trim();
  const screenshot = formData.get("screenshot");

  if (beschreibung.length < 5) {
    return {
      ok: false,
      message: "Bitte beschreibe das Problem (mindestens 5 Zeichen).",
    };
  }

  const supabase = await createClient();

  let screenshotPath: string | null = null;
  if (screenshot instanceof File && screenshot.size > 0) {
    if (screenshot.size > SCREENSHOT_MAX_BYTES) {
      return { ok: false, message: "Screenshot ist zu groß (max 5 MB)." };
    }
    if (!SCREENSHOT_ERLAUBT.includes(screenshot.type)) {
      return {
        ok: false,
        message: "Screenshot: Nur JPG, PNG oder WebP erlaubt.",
      };
    }
    const ext = screenshot.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await screenshot.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("bug-screenshots")
      .upload(path, buffer, {
        contentType: screenshot.type,
        upsert: false,
      });
    if (uploadError) {
      return {
        ok: false,
        message: "Screenshot-Upload fehlgeschlagen: " + uploadError.message,
      };
    }
    screenshotPath = path;
  }

  const erlaubteKategorien: BugKategorie[] = [
    "bug",
    "ui",
    "vorschlag",
    "sonstiges",
  ];
  const erlaubtePrios: BugPrioritaet[] = [
    "niedrig",
    "normal",
    "hoch",
    "kritisch",
  ];

  const { data, error } = await supabase
    .from("bug_reports")
    .insert({
      beschreibung,
      kategorie: erlaubteKategorien.includes(kategorie) ? kategorie : "bug",
      prioritaet: erlaubtePrios.includes(prioritaet) ? prioritaet : "normal",
      pfad: pfad.length > 0 ? pfad : null,
      user_agent: userAgent.length > 0 ? userAgent : null,
      screenshot_path: screenshotPath,
      quelle: "manuell",
      status: "neu",
      reported_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: "Speichern fehlgeschlagen: " + (error?.message ?? "unbekannt"),
    };
  }

  revalidatePath("/admin/bug-reports");
  return { ok: true, id: data.id };
}

// =================================================================
// Admin-Actions (Status, Priorität, Notiz, Löschen)
// =================================================================

export async function bugStatusSetzen(
  id: string,
  status: BugStatus,
): Promise<void> {
  await requirePermission("bug_reports", "edit");
  const supabase = await createClient();
  const { error } = await supabase
    .from("bug_reports")
    .update({
      status,
      resolved_at:
        status === "behoben" || status === "verworfen"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id);
  if (error) {
    redirect(`/admin/bug-reports/${id}?toast=error`);
  }
  revalidatePath("/admin/bug-reports");
  revalidatePath(`/admin/bug-reports/${id}`);
  redirect(`/admin/bug-reports/${id}?toast=saved`);
}

export async function bugPrioritaetSetzen(
  id: string,
  prioritaet: BugPrioritaet,
): Promise<void> {
  await requirePermission("bug_reports", "edit");
  const supabase = await createClient();
  await supabase
    .from("bug_reports")
    .update({ prioritaet })
    .eq("id", id);
  revalidatePath("/admin/bug-reports");
  revalidatePath(`/admin/bug-reports/${id}`);
  redirect(`/admin/bug-reports/${id}?toast=saved`);
}

export async function bugNotizSpeichern(
  id: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("bug_reports", "edit");
  const notiz = String(formData.get("admin_notiz") ?? "").trim();
  const supabase = await createClient();
  await supabase
    .from("bug_reports")
    .update({ admin_notiz: notiz.length > 0 ? notiz : null })
    .eq("id", id);
  revalidatePath(`/admin/bug-reports/${id}`);
  redirect(`/admin/bug-reports/${id}?toast=saved`);
}

export async function bugLoeschen(id: string): Promise<void> {
  await requirePermission("bug_reports", "delete");
  const supabase = await createClient();
  // Screenshot ggfs. mit loeschen
  const { data: row } = await supabase
    .from("bug_reports")
    .select("screenshot_path")
    .eq("id", id)
    .maybeSingle();
  if (row?.screenshot_path) {
    await supabase.storage
      .from("bug-screenshots")
      .remove([row.screenshot_path]);
  }
  const { error } = await supabase.from("bug_reports").delete().eq("id", id);
  if (error) {
    redirect(`/admin/bug-reports/${id}?toast=error`);
  }
  revalidatePath("/admin/bug-reports");
  redirect("/admin/bug-reports?toast=deleted");
}
