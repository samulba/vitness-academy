import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profil, Rolle } from "@/lib/rollen";

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

  // Erst mit kann_provisionen versuchen, fallback ohne falls Migration
  // 0034 noch nicht eingespielt ist.
  let row: Record<string, unknown> | null = null;
  const erst = await supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path, kann_provisionen",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (erst.data) {
    row = erst.data as Record<string, unknown>;
  } else {
    const fb = await supabase
      .from("profiles")
      .select(
        "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path",
      )
      .eq("id", user.id)
      .maybeSingle();
    if (fb.data) row = fb.data as Record<string, unknown>;
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
    redirect("/dashboard");
  }
  return profile;
}
