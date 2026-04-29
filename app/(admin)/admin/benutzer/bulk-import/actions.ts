"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type BulkInputRow = {
  zeile: number;
  vorname: string;
  nachname: string;
  email: string;
  rolle: "mitarbeiter" | "fuehrungskraft";
  lernpfade: string[]; // bereits gemappte IDs
};

export type BulkErgebnis = {
  zeile: number;
  email: string;
  ok: boolean;
  message?: string;
};

export async function bulkImportieren(
  rows: BulkInputRow[],
): Promise<{ ergebnisse: BulkErgebnis[] }> {
  const aktuellerAdmin = await requireRole(["admin", "superadmin"]);
  const admin = createAdminClient();
  const ergebnisse: BulkErgebnis[] = [];

  for (const r of rows) {
    const fullName = [r.vorname, r.nachname].filter(Boolean).join(" ") || null;

    const { data: inviteData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(r.email, {
        data: {
          full_name: fullName,
          first_name: r.vorname,
          last_name: r.nachname,
        },
      });

    if (inviteError || !inviteData.user) {
      ergebnisse.push({
        zeile: r.zeile,
        email: r.email,
        ok: false,
        message: inviteError?.message ?? "Invite fehlgeschlagen",
      });
      continue;
    }

    const userId = inviteData.user.id;

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        first_name: r.vorname.length > 0 ? r.vorname : null,
        last_name: r.nachname.length > 0 ? r.nachname : null,
        full_name: fullName,
        role: r.rolle,
      })
      .eq("id", userId);

    if (profileError) {
      ergebnisse.push({
        zeile: r.zeile,
        email: r.email,
        ok: false,
        message: "Profil-Update: " + profileError.message,
      });
      continue;
    }

    if (r.lernpfade.length > 0) {
      const assignments = r.lernpfade.map((pfadId) => ({
        user_id: userId,
        learning_path_id: pfadId,
        assigned_by: aktuellerAdmin.id,
      }));
      await admin.from("user_learning_path_assignments").insert(assignments);
    }

    ergebnisse.push({ zeile: r.zeile, email: r.email, ok: true });
  }

  revalidatePath("/admin/benutzer");
  return { ergebnisse };
}
