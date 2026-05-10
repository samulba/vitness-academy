import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  istFuehrungskraftOderHoeher,
  type Profil,
  type Rolle,
} from "@/lib/rollen";

export type { Profil, Rolle } from "@/lib/rollen";
export {
  istAdmin,
  istFuehrungskraftOderHoeher,
  startseiteFuerRolle,
} from "@/lib/rollen";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Drei-Stufen-Fallback fuer Migrations-Lag:
  //   Voll  = mit template_id (Migration 0050)
  //   Mid   = mit kann_provisionen (Migration 0034) ohne template_id
  //   Basis = ohne beides
  let row: Record<string, unknown> | null = null;
  const voll = await supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path, kann_provisionen, template_id",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (voll.data) {
    row = voll.data as Record<string, unknown>;
  } else {
    const mid = await supabase
      .from("profiles")
      .select(
        "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path, kann_provisionen",
      )
      .eq("id", user.id)
      .maybeSingle();
    if (mid.data) {
      row = mid.data as Record<string, unknown>;
    } else {
      const basis = await supabase
        .from("profiles")
        .select(
          "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path",
        )
        .eq("id", user.id)
        .maybeSingle();
      if (basis.data) row = basis.data as Record<string, unknown>;
    }
  }
  if (!row) return null;

  return {
    id: row.id as string,
    full_name: (row.full_name as string | null) ?? null,
    first_name: (row.first_name as string | null) ?? null,
    last_name: (row.last_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    role: row.role as Rolle,
    location_id: (row.location_id as string | null) ?? null,
    onboarding_done: Boolean(row.onboarding_done),
    archived_at: (row.archived_at as string | null) ?? null,
    avatar_path: (row.avatar_path as string | null) ?? null,
    kann_provisionen: Boolean(row.kann_provisionen),
    template_id: (row.template_id as string | null) ?? null,
  };
}

export async function requireProfile(): Promise<Profil> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.archived_at) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?archived=1");
  }
  return profile;
}

export async function requireRole(roles: Rolle[]): Promise<Profil> {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) {
    // Smart-Fallback: Fuehrungskraft+ bleibt im Admin-Bereich (nur diese
    // Action war zu strikt fuer ihre Rolle). Echter Mitarbeiter ohne
    // Admin-Zugang wird zur Mitarbeiter-Startseite geschickt.
    redirect(istFuehrungskraftOderHoeher(profile.role) ? "/admin" : "/dashboard");
  }
  return profile;
}
