"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const VALID_LAUFZEITEN = ["26", "52", "104", "sonst"];

function parseProzent(raw: FormDataEntryValue | null): number {
  if (raw === null) return 0;
  const s = String(raw).trim().replace(/,/g, ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

export async function satzAnlegen(formData: FormData): Promise<void> {
  await requirePermission("provisionen", "create");
  const laufzeit = String(formData.get("laufzeit") ?? "");
  const prozent_beitrag = parseProzent(formData.get("prozent_beitrag"));
  const prozent_startpaket = parseProzent(formData.get("prozent_startpaket"));
  const valid_from = String(formData.get("valid_from") ?? "").trim();

  if (!VALID_LAUFZEITEN.includes(laufzeit)) {
    redirect("/admin/provisionen/saetze?toast=error");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valid_from)) {
    redirect("/admin/provisionen/saetze?toast=error");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("commission_rates").insert({
    laufzeit,
    prozent_beitrag,
    prozent_startpaket,
    valid_from,
  });
  if (error) {
    redirect("/admin/provisionen/saetze?toast=error");
  }
  revalidatePath("/admin/provisionen");
  revalidatePath("/admin/provisionen/saetze");
  revalidatePath("/provisionen");
  redirect("/admin/provisionen/saetze?toast=saved");
}

export async function satzLoeschen(id: string): Promise<void> {
  await requirePermission("provisionen", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_rates")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[satzLoeschen]", error);
    redirect("/admin/provisionen/saetze?toast=error");
  }
  revalidatePath("/admin/provisionen/saetze");
  revalidatePath("/provisionen");
  redirect("/admin/provisionen/saetze?toast=deleted");
}

// =============================================================
// Persönliche Sätze pro Vertriebler
// =============================================================

export async function personalSatzAnlegen(
  vertrieblerId: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("provisionen", "create");
  const laufzeit = String(formData.get("laufzeit") ?? "");
  const prozent_beitrag = parseProzent(formData.get("prozent_beitrag"));
  const prozent_startpaket = parseProzent(formData.get("prozent_startpaket"));
  const valid_from = String(formData.get("valid_from") ?? "").trim();
  const notiz = String(formData.get("notiz") ?? "").trim() || null;

  if (!VALID_LAUFZEITEN.includes(laufzeit)) {
    redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=error`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valid_from)) {
    redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("commission_rates_personal").insert({
    vertriebler_id: vertrieblerId,
    laufzeit,
    prozent_beitrag,
    prozent_startpaket,
    valid_from,
    notiz,
  });
  if (error) {
    redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=error`);
  }
  revalidatePath(`/admin/provisionen/saetze/${vertrieblerId}`);
  revalidatePath("/admin/provisionen/saetze");
  revalidatePath("/admin/provisionen");
  revalidatePath("/provisionen");
  redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=saved`);
}

export async function personalSatzLoeschen(
  id: string,
  vertrieblerId: string,
): Promise<void> {
  await requirePermission("provisionen", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_rates_personal")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[personalSatzLoeschen]", error);
    redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=error`);
  }
  revalidatePath(`/admin/provisionen/saetze/${vertrieblerId}`);
  revalidatePath("/admin/provisionen/saetze");
  revalidatePath("/admin/provisionen");
  revalidatePath("/provisionen");
  redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=deleted`);
}

// =============================================================
// Bonus-Stufen
// =============================================================

function parseInt0(raw: FormDataEntryValue | null): number {
  if (raw === null) return 0;
  const n = parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function bonusStufeAnlegen(formData: FormData): Promise<void> {
  await requirePermission("provisionen", "create");
  const ab = parseInt0(formData.get("ab_abschluessen"));
  const prozent = parseProzent(formData.get("bonus_prozent"));
  const valid_from = String(formData.get("valid_from") ?? "").trim();
  const vertriebler_id = (formData.get("vertriebler_id") as string) || null;

  if (ab <= 0 || prozent <= 0) {
    redirect(
      vertriebler_id
        ? `/admin/provisionen/saetze/${vertriebler_id}?toast=error`
        : "/admin/provisionen/saetze?toast=error",
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valid_from)) {
    redirect(
      vertriebler_id
        ? `/admin/provisionen/saetze/${vertriebler_id}?toast=error`
        : "/admin/provisionen/saetze?toast=error",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("commission_bonus_stufen").insert({
    vertriebler_id,
    ab_abschluessen: ab,
    bonus_prozent: prozent,
    valid_from,
  });
  if (error) {
    redirect(
      vertriebler_id
        ? `/admin/provisionen/saetze/${vertriebler_id}?toast=error`
        : "/admin/provisionen/saetze?toast=error",
    );
  }

  revalidatePath("/admin/provisionen/saetze");
  if (vertriebler_id)
    revalidatePath(`/admin/provisionen/saetze/${vertriebler_id}`);
  revalidatePath("/admin/provisionen");
  revalidatePath("/provisionen");

  redirect(
    vertriebler_id
      ? `/admin/provisionen/saetze/${vertriebler_id}?toast=saved`
      : "/admin/provisionen/saetze?toast=saved",
  );
}

export async function bonusStufeLoeschen(id: string): Promise<void> {
  await requirePermission("provisionen", "delete");
  const supabase = await createClient();
  // Vertriebler_id holen für sauberen redirect
  const { data: row } = await supabase
    .from("commission_bonus_stufen")
    .select("vertriebler_id")
    .eq("id", id)
    .maybeSingle();
  const vid = row?.vertriebler_id as string | null | undefined;

  const { error } = await supabase
    .from("commission_bonus_stufen")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[bonusStufeLoeschen]", error);
    redirect(
      vid
        ? `/admin/provisionen/saetze/${vid}?toast=error`
        : "/admin/provisionen/saetze?toast=error",
    );
  }

  revalidatePath("/admin/provisionen/saetze");
  if (vid) revalidatePath(`/admin/provisionen/saetze/${vid}`);
  revalidatePath("/admin/provisionen");
  revalidatePath("/provisionen");

  redirect(
    vid
      ? `/admin/provisionen/saetze/${vid}?toast=deleted`
      : "/admin/provisionen/saetze?toast=deleted",
  );
}

// =============================================================
// Targets (Monatsziele)
// =============================================================

export async function targetSetzen(
  vertrieblerId: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("provisionen", "edit");
  const monatYYYYMM = String(formData.get("monat_yyyymm") ?? "").trim();
  const zielAbschluesseRaw = String(
    formData.get("ziel_abschluesse") ?? "",
  ).trim();
  const zielProvisionRaw = String(
    formData.get("ziel_provision") ?? "",
  ).trim();
  const notiz = String(formData.get("notiz") ?? "").trim() || null;

  if (!/^\d{4}-\d{2}$/.test(monatYYYYMM)) {
    redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=error`);
  }
  const ziel_abschluesse = zielAbschluesseRaw
    ? parseInt(zielAbschluesseRaw, 10)
    : null;
  const ziel_provision = zielProvisionRaw
    ? parseFloat(zielProvisionRaw.replace(/\./g, "").replace(",", "."))
    : null;

  const supabase = await createClient();
  const { error } = await supabase.from("commission_targets").upsert(
    {
      vertriebler_id: vertrieblerId,
      monat_yyyymm: monatYYYYMM,
      ziel_abschluesse,
      ziel_provision,
      notiz,
    },
    { onConflict: "vertriebler_id,monat_yyyymm" },
  );
  if (error) {
    redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=error`);
  }
  revalidatePath(`/admin/provisionen/saetze/${vertrieblerId}`);
  revalidatePath("/provisionen");
  redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=saved`);
}

export async function targetLoeschen(
  id: string,
  vertrieblerId: string,
): Promise<void> {
  await requirePermission("provisionen", "delete");
  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_targets")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[targetLoeschen]", error);
    redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=error`);
  }
  revalidatePath(`/admin/provisionen/saetze/${vertrieblerId}`);
  revalidatePath("/provisionen");
  redirect(`/admin/provisionen/saetze/${vertrieblerId}?toast=deleted`);
}
