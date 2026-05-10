import { createAdminClient } from "@/lib/supabase/admin";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";

/**
 * Auth-Status eines Mitarbeiters basierend auf den auth.users-Feldern.
 *   eingeladen — Invite gesendet, User hat sich nie eingeloggt
 *   aktiv      — User hat sich schon mal eingeloggt
 *   inaktiv    — User war > 30 Tage nicht mehr aktiv
 */
export type AuthStatus = "eingeladen" | "aktiv" | "inaktiv";

export type AuthStatusInfo = {
  status: AuthStatus;
  invited_at: string | null;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
};

const INAKTIV_TAGE = 30;

function bestimmeStatus(user: {
  invited_at?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
}): AuthStatus {
  // Wenn nie eingeloggt UND eingeladen → noch in Einladungs-Phase
  if (!user.last_sign_in_at && user.invited_at) return "eingeladen";
  // Wenn nie bestätigt + nie eingeloggt → eingeladen (Edge-Case)
  if (!user.last_sign_in_at && !user.email_confirmed_at) return "eingeladen";
  // Wenn lange inaktiv
  if (user.last_sign_in_at) {
    const tageOhne =
      (Date.now() - new Date(user.last_sign_in_at).getTime()) /
      (24 * 60 * 60 * 1000);
    if (tageOhne > INAKTIV_TAGE) return "inaktiv";
  }
  return "aktiv";
}

/**
 * Laedt den Auth-Status für eine Liste von User-IDs aus auth.users.
 * Nutzt den Admin-Client (Service-Role-Key noetig). Gibt eine Map
 * userId -> AuthStatusInfo zurueck. Bei Fehler: leere Map (defensiv).
 */
export async function ladeAuthStatusBatch(
  userIds: string[],
): Promise<Map<string, AuthStatusInfo>> {
  if (userIds.length === 0) return new Map();
  try {
    const admin = createAdminClient();
    // Auth Admin API hat kein direktes "select where id IN (...)" —
    // aber listUsers paginiert über alle. Bei kleineren Teams (<200)
    // reicht eine Page mit perPage=200.
    const wanted = new Set(userIds);
    const map = new Map<string, AuthStatusInfo>();

    let page = 1;
    const perPage = 200;
    // Max 5 Pages (1000 User) — sollte für alle realistischen Studio-
    // Teams ausreichen. Wenn doch größer, sehen wir das im Log.
    for (let i = 0; i < 5; i++) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) {
        console.warn("[ladeAuthStatusBatch] listUsers error:", error);
        break;
      }
      for (const u of data.users ?? []) {
        if (!wanted.has(u.id)) continue;
        map.set(u.id, {
          invited_at: u.invited_at ?? null,
          email_confirmed_at: u.email_confirmed_at ?? null,
          last_sign_in_at: u.last_sign_in_at ?? null,
          status: bestimmeStatus({
            invited_at: u.invited_at,
            email_confirmed_at: u.email_confirmed_at,
            last_sign_in_at: u.last_sign_in_at,
          }),
        });
      }
      if (!data.users || data.users.length < perPage) break;
      page++;
    }

    // Für User die nicht in auth.users gefunden wurden: Default "aktiv"
    // (Profile existiert, daher gibt's einen Auth-User — aber Listing
    // hat ihn nicht ausgeliefert, z.B. archiviert oder Pagination)
    for (const id of userIds) {
      if (!map.has(id)) {
        map.set(id, {
          invited_at: null,
          email_confirmed_at: null,
          last_sign_in_at: null,
          status: "aktiv",
        });
      }
    }
    return map;
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeAuthStatusBatch] crashed:", e);
    return new Map();
  }
}

/**
 * Laedt den Auth-Status eines einzelnen Users (für Detail-Pages).
 */
export async function ladeAuthStatus(
  userId: string,
): Promise<AuthStatusInfo | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    const u = data.user;
    return {
      invited_at: u.invited_at ?? null,
      email_confirmed_at: u.email_confirmed_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
      status: bestimmeStatus({
        invited_at: u.invited_at,
        email_confirmed_at: u.email_confirmed_at,
        last_sign_in_at: u.last_sign_in_at,
      }),
    };
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeAuthStatus] crashed:", e);
    return null;
  }
}
